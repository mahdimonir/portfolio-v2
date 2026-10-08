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
      coverImage,
      role,
      duration,
      client,
      status,
      cta,
      liveUrl,
      codeUrl,
      order,
      featured,
      categoryId,
      images = [],
      features = [],
      techStackIds = [],
    } = body;

    if (!slug || !title || !description || !coverImage || !categoryId) {
      return NextResponse.json(
        { error: "Slug, title, description, coverImage, and categoryId are required" },
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
        coverImage: coverImage.trim(),
        role: role ?? null,
        duration: duration ?? null,
        client: client ?? null,
        status: status ?? "Completed",
        cta: cta ?? "View Project",
        liveUrl: liveUrl ?? null,
        codeUrl: codeUrl ?? null,
        order: order ?? 0,
        featured: Boolean(featured),
        categoryId: Number(categoryId),
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
        techStacks: { include: { techStack: true } },
      },
    });

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
