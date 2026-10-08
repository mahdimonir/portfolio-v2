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

// GET /api/projects/[slug] — get single project with full details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const project = await prisma.project.findUnique({
      where: { slug: slug.toLowerCase() },
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

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("GET /api/projects/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[slug] — update project (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();

    const existing = await prisma.project.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const {
      displayId,
      newSlug,
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
      apiUrl,
      playStoreUrl,
      appStoreUrl,
      links,
      order,
      featured,
      categoryId,
      images,
      features,
      tech,
    } = body;

    const resolvedLiveUrl = links?.live !== undefined ? links.live : liveUrl;
    const resolvedCodeUrl = links?.code !== undefined ? links.code : codeUrl;

    const updated = await prisma.project.update({
      where: { id: existing.id },
      data: {
        ...(displayId ? { displayId } : {}),
        ...(newSlug ? { slug: newSlug.toLowerCase().trim() } : {}),
        ...(title ? { title: title.trim() } : {}),
        ...(tagline !== undefined ? { tagline } : {}),
        ...(stack !== undefined ? { stack } : {}),
        ...(description ? { description: description.trim() } : {}),
        ...(longDescription !== undefined ? { longDescription } : {}),
        ...(coverImage ? { coverImage: coverImage.trim() } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(duration !== undefined ? { duration } : {}),
        ...(client !== undefined ? { client } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(cta !== undefined ? { cta } : {}),
        ...(resolvedLiveUrl !== undefined ? { liveUrl: resolvedLiveUrl } : {}),
        ...(resolvedCodeUrl !== undefined ? { codeUrl: resolvedCodeUrl } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
        ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
        ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      },
      include: {
        category: true,
        images: true,
        features: true,
        techStacks: { include: { techStack: true } },
      },
    });

    // Synchronize images if array provided
    if (Array.isArray(images)) {
      await prisma.projectImage.deleteMany({ where: { projectId: existing.id } });
      if (images.length > 0) {
        await prisma.projectImage.createMany({
          data: images.map((url: string, index: number) => ({
            projectId: existing.id,
            url,
            order: index,
          })),
        });
      }
    }

    // Synchronize features if array provided
    if (Array.isArray(features)) {
      await prisma.projectFeature.deleteMany({ where: { projectId: existing.id } });
      if (features.length > 0) {
        await prisma.projectFeature.createMany({
          data: features.map((text: string, index: number) => ({
            projectId: existing.id,
            text,
            order: index,
          })),
        });
      }
    }

    // Synchronize tech stacks if array provided
    if (Array.isArray(tech)) {
      await prisma.projectTechStack.deleteMany({ where: { projectId: existing.id } });
      for (let tIdx = 0; tIdx < tech.length; tIdx++) {
        const item = tech[tIdx];
        const techName = typeof item === "string" ? item : item.name;
        if (!techName) continue;

        let techRecord = await prisma.techStack.findUnique({
          where: { name: techName },
        });

        if (!techRecord) {
          techRecord = await prisma.techStack.create({
            data: {
              name: techName,
              role: (typeof item === "object" ? item.category : null) || "Full Stack",
              iconUrl: typeof item === "object" ? item.iconUrl || null : null,
            },
          });
        }

        await prisma.projectTechStack.create({
          data: {
            projectId: existing.id,
            techStackId: techRecord.id,
            order: tIdx,
          },
        });
      }
    }

    // Sync to local JSON file for server-side static reads
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "src", "lib", "portfolio-db.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.projects)) {
        const pIndex = parsed.projects.findIndex((p: any) => p.slug === slug || p.slug === existing.slug);
        if (pIndex !== -1) {
          if (featured !== undefined) parsed.projects[pIndex].featured = Boolean(featured);
          if (title) parsed.projects[pIndex].title = title;
          if (tagline !== undefined) parsed.projects[pIndex].tagline = tagline;
          if (stack !== undefined) parsed.projects[pIndex].stack = stack;
          if (description) parsed.projects[pIndex].description = description;
          if (longDescription !== undefined) parsed.projects[pIndex].longDescription = longDescription;
          if (coverImage) parsed.projects[pIndex].image = coverImage;
          if (Array.isArray(images)) parsed.projects[pIndex].images = images;
          if (Array.isArray(features)) parsed.projects[pIndex].features = features;
          if (Array.isArray(tech)) parsed.projects[pIndex].tech = tech;
          if (role !== undefined) parsed.projects[pIndex].role = role;
          if (duration !== undefined) parsed.projects[pIndex].duration = duration;
          if (client !== undefined) parsed.projects[pIndex].client = client;
          if (status !== undefined) parsed.projects[pIndex].status = status;
          if (cta !== undefined) parsed.projects[pIndex].cta = cta;

          if (!parsed.projects[pIndex].links) parsed.projects[pIndex].links = {};
          if (resolvedLiveUrl !== undefined) parsed.projects[pIndex].links.live = resolvedLiveUrl;
          if (resolvedCodeUrl !== undefined) parsed.projects[pIndex].links.code = resolvedCodeUrl;
          if (apiUrl !== undefined) parsed.projects[pIndex].links.api = apiUrl;
          if (links?.api !== undefined) parsed.projects[pIndex].links.api = links.api;
          if (playStoreUrl !== undefined) parsed.projects[pIndex].links.play_store = playStoreUrl;
          if (links?.play_store !== undefined) parsed.projects[pIndex].links.play_store = links.play_store;
          if (appStoreUrl !== undefined) parsed.projects[pIndex].links.app_store = appStoreUrl;
          if (links?.app_store !== undefined) parsed.projects[pIndex].links.app_store = links.app_store;

          if (newSlug) parsed.projects[pIndex].slug = newSlug.toLowerCase().trim();
          await fs.writeFile(filePath, JSON.stringify(parsed, null, 2), "utf-8");
        }
      }
    } catch (fsErr) {
      console.warn("Project JSON file sync skipped:", fsErr);
    }

    // Revalidate affected pages
    try {
      invalidatePortfolioCache();
      revalidatePath("/", "layout");
      revalidatePath("/projects");
      revalidatePath(`/projects/${slug}`);
      if (newSlug && newSlug.toLowerCase().trim() !== slug.toLowerCase().trim()) {
        revalidatePath(`/projects/${newSlug.toLowerCase().trim()}`);
      }
      revalidatePath("/projects/[slug]", "page");
    } catch (revErr) {
      console.warn("Revalidation warning:", revErr);
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("PUT /api/projects/[slug] error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE /api/projects/[slug] — delete project (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const cleanSlug = slug.toLowerCase().trim();
    const existing = await prisma.project.findUnique({
      where: { slug: cleanSlug },
    });

    let deletedFromDb = false;
    if (existing) {
      await prisma.project.delete({
        where: { id: existing.id },
      });
      deletedFromDb = true;
    }

    // Also remove from fallback portfolio-db.json so it is never resurrected
    let deletedFromJson = false;
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "src", "lib", "portfolio-db.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.projects)) {
        const initialCount = parsed.projects.length;
        parsed.projects = parsed.projects.filter(
          (p: any) => p.slug.toLowerCase().trim() !== cleanSlug
        );
        if (parsed.projects.length !== initialCount) {
          deletedFromJson = true;
          await fs.writeFile(filePath, JSON.stringify(parsed, null, 2), "utf-8");
        }
      }
    } catch (fsErr) {
      console.warn("Fallback JSON delete sync error:", fsErr);
    }

    if (!deletedFromDb && !deletedFromJson) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Revalidate affected pages and purge in-memory cache
    try {
      invalidatePortfolioCache();
      revalidatePath("/", "layout");
      revalidatePath("/projects");
      revalidatePath(`/projects/${cleanSlug}`);
      revalidatePath("/projects/[slug]", "page");
    } catch (revErr) {
      console.warn("Revalidation warning:", revErr);
    }

    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error) {
    console.error("DELETE /api/projects/[slug] error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
