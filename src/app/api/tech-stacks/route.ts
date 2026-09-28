import { NextRequest, NextResponse } from "next/server";
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

// GET /api/tech-stacks — list all technologies
export async function GET() {
  try {
    const techStacks = await prisma.techStack.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { projectTechs: true, skillGroupItems: true },
        },
      },
    });
    return NextResponse.json(techStacks);
  } catch (error) {
    console.error("GET /api/tech-stacks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tech stacks" },
      { status: 500 }
    );
  }
}

// POST /api/tech-stacks — add new tech stack (admin)
export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, role, iconUrl } = await request.json();
    if (!name || !role) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
    }

    const tech = await prisma.techStack.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        iconUrl: iconUrl?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, tech });
  } catch (error) {
    console.error("POST /api/tech-stacks error:", error);
    return NextResponse.json({ error: "Failed to create tech stack" }, { status: 500 });
  }
}

// PUT /api/tech-stacks — update tech stack (admin)
export async function PUT(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, role, iconUrl } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Tech stack ID is required" }, { status: 400 });
    }

    const updated = await prisma.techStack.update({
      where: { id: Number(id) },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(role ? { role: role.trim() } : {}),
        ...(iconUrl !== undefined ? { iconUrl: iconUrl?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ success: true, tech: updated });
  } catch (error) {
    console.error("PUT /api/tech-stacks error:", error);
    return NextResponse.json({ error: "Failed to update tech stack" }, { status: 500 });
  }
}

// DELETE /api/tech-stacks — delete tech stack (admin)
export async function DELETE(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Tech stack ID is required" }, { status: 400 });
    }

    await prisma.techStack.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Tech stack deleted" });
  } catch (error) {
    console.error("DELETE /api/tech-stacks error:", error);
    return NextResponse.json({ error: "Failed to delete tech stack" }, { status: 500 });
  }
}
