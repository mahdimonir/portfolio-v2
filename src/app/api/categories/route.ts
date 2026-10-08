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

// GET /api/categories — list all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories — create new category (admin)
export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug, label, order } = await request.json();
    if (!slug || !label) {
      return NextResponse.json({ error: "Slug and label are required" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        slug: slug.toLowerCase().trim(),
        label: label.trim(),
        order: order ?? 0,
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/projects");
    } catch {}

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// PUT /api/categories — update category (admin)
export async function PUT(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, slug, label, order } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        ...(slug ? { slug: slug.toLowerCase().trim() } : {}),
        ...(label ? { label: label.trim() } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/projects");
    } catch {}

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error("PUT /api/categories error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/categories — delete category (admin)
export async function DELETE(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: Number(id) },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/projects");
    } catch {}

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("DELETE /api/categories error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
