import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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
      order,
      featured,
      categoryId,
    } = body;

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
        ...(liveUrl !== undefined ? { liveUrl } : {}),
        ...(codeUrl !== undefined ? { codeUrl } : {}),
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
          if (coverImage) {
            parsed.projects[pIndex].image = coverImage;
            if (Array.isArray(parsed.projects[pIndex].images)) {
              if (!parsed.projects[pIndex].images.includes(coverImage)) {
                parsed.projects[pIndex].images.unshift(coverImage);
              }
            } else {
              parsed.projects[pIndex].images = [coverImage];
            }
          }
          if (role !== undefined) parsed.projects[pIndex].role = role;
          if (duration !== undefined) parsed.projects[pIndex].duration = duration;
          if (client !== undefined) parsed.projects[pIndex].client = client;
          if (status !== undefined) parsed.projects[pIndex].status = status;
          if (cta !== undefined) parsed.projects[pIndex].cta = cta;
          if (liveUrl !== undefined) {
            if (!parsed.projects[pIndex].links) parsed.projects[pIndex].links = {};
            parsed.projects[pIndex].links.live = liveUrl;
          }
          if (codeUrl !== undefined) {
            if (!parsed.projects[pIndex].links) parsed.projects[pIndex].links = {};
            parsed.projects[pIndex].links.code = codeUrl;
          }
          if (newSlug) parsed.projects[pIndex].slug = newSlug.toLowerCase().trim();
          await fs.writeFile(filePath, JSON.stringify(parsed, null, 2), "utf-8");
        }
      }
    } catch (fsErr) {
      console.warn("Project JSON file sync skipped:", fsErr);
    }

    // Revalidate affected pages
    try {
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
    const existing = await prisma.project.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id: existing.id },
    });

    // Revalidate affected pages
    try {
      revalidatePath("/", "layout");
      revalidatePath("/projects");
      revalidatePath(`/projects/${slug}`);
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
