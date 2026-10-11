import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { invalidatePortfolioCache } from "@/lib/portfolio-service";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super_secret_portfolio_jwt_key_2026_secure"
);

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// GET /api/projects — list all projects with relations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {};
    if (categorySlug && categorySlug !== "all") {
      where.category = { slug: categorySlug };
    }
    if (featured === "true") {
      where.featured = true;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        features: { orderBy: { order: "asc" } },
        variants: { orderBy: { order: "asc" } },
        techStacks: {
          orderBy: { order: "asc" },
          include: { techStack: true },
        },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects — create new project (admin)
export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      displayId,
      slug,
      title,
      tagline,
      stack,
      description,
      longDescription,
      coverImage: rawCoverImage,
      role,
      duration,
      client,
      status,
      cta,
      liveUrl: rawLiveUrl,
      codeUrl,
      order,
      featured,
      categoryId,
      categorySlug,
      categoryName,
      images = [],
      features = [],
      tech = [],
      techStackIds = [],
      variants = [],
    } = body;

    // Resolve categoryId if categorySlug or categoryName provided instead
    let resolvedCategoryId = Number(categoryId);
    if (!resolvedCategoryId && (categorySlug || categoryName)) {
      const foundCat = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: (categorySlug || "").toLowerCase().trim() },
            { label: categoryName || "" },
          ],
        },
      });
      if (foundCat) resolvedCategoryId = foundCat.id;
    }
    if (!resolvedCategoryId) {
      const firstCat = await prisma.category.findFirst();
      if (firstCat) resolvedCategoryId = firstCat.id;
    }

    // Default variants array: every project has at least 1 variant
    const resolvedVariants = Array.isArray(variants) && variants.length > 0
      ? variants
      : [
          {
            name: "Main Edition",
            badge: null,
            previewImage: rawCoverImage || (images[0] ?? null),
            liveUrl: rawLiveUrl ?? null,
            order: 0,
          },
        ];

    const resolvedCoverImage = (rawCoverImage || resolvedVariants[0]?.previewImage || images[0] || "").trim();
    const resolvedLiveUrl = rawLiveUrl ?? resolvedVariants[0]?.liveUrl ?? null;

    if (!slug || !title || !description || !resolvedCategoryId) {
      return NextResponse.json(
        { error: "Slug, title, description, and category are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        displayId: displayId || "01",
        slug: slug.toLowerCase().trim(),
        title: title.trim(),
        tagline: tagline ?? null,
        stack: stack ?? "",
        description: description.trim(),
        longDescription: longDescription ?? null,
        coverImage: resolvedCoverImage,
        role: role ?? null,
        duration: duration ?? null,
        client: client ?? null,
        status: status ?? "Completed",
        cta: cta ?? "View Project",
        liveUrl: resolvedLiveUrl,
        codeUrl: codeUrl ?? null,
        order: order ?? 0,
        featured: Boolean(featured),
        categoryId: resolvedCategoryId,
        images: {
          create: images.map((url: string, index: number) => ({
            url,
            order: index,
          })),
        },
        features: {
          create: features.map((text: string, index: number) => ({
            text,
            order: index,
          })),
        },
        variants: {
          create: resolvedVariants.map((v: any, index: number) => ({
            name: v.name || `Edition ${index + 1}`,
            badge: v.badge || null,
            previewImage: v.previewImage || null,
            liveUrl: v.liveUrl || null,
            order: v.order !== undefined ? v.order : index,
          })),
        },
        techStacks: {
          create: techStackIds.map((techId: number, index: number) => ({
            techStackId: Number(techId),
            order: index,
          })),
        },
      },
      include: {
        category: true,
        images: true,
        features: true,
        variants: { orderBy: { order: "asc" } },
        techStacks: { include: { techStack: true } },
      },
    });

    // Also sync to local JSON fallback
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "src", "lib", "portfolio-db.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.projects)) {
        parsed.projects.unshift({
          id: project.displayId,
          slug: project.slug,
          title: project.title,
          tagline: project.tagline,
          stack: project.stack,
          description: project.description,
          longDescription: project.longDescription,
          image: project.coverImage,
          images: images.length > 0 ? images : [project.coverImage],
          links: {
            live: project.liveUrl,
            code: project.codeUrl,
          },
          cta: project.cta,
          category: project.category?.label || "Full Stack",
          role: project.role,
          duration: project.duration,
          client: project.client,
          status: project.status,
          featured: project.featured,
          features,
          tech: Array.isArray(tech) ? tech : [],
          variants: resolvedVariants.map((v: any, idx: number) => ({
            name: v.name,
            badge: v.badge || null,
            previewImage: v.previewImage || null,
            liveUrl: v.liveUrl || null,
            order: idx,
          })),
        });
        await fs.writeFile(filePath, JSON.stringify(parsed, null, 2), "utf-8");
      }
    } catch (fsErr) {
      console.warn("Fallback JSON write skipped:", fsErr);
    }

    try {
      invalidatePortfolioCache();
      revalidatePath("/", "layout");
      revalidatePath("/projects");
      revalidatePath(`/projects/${project.slug}`);
      revalidatePath("/projects/[slug]", "page");
    } catch (revErr) {
      console.warn("Revalidation warning:", revErr);
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
