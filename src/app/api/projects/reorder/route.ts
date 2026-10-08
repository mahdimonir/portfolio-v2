import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

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

// POST /api/projects/reorder — fast lightweight project reordering
export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderList } = await request.json(); // Array of { slug: string, order: number, featured?: boolean }
    if (!Array.isArray(orderList)) {
      return NextResponse.json({ error: "orderList array is required" }, { status: 400 });
    }

    // Fast transaction to update order and featured per project
    await prisma.$transaction(
      orderList.map((item) =>
        prisma.project.updateMany({
          where: { slug: item.slug.toLowerCase().trim() },
          data: {
            order: Number(item.order),
            ...(item.featured !== undefined ? { featured: Boolean(item.featured) } : {}),
          },
        })
      )
    );

    // Sync order in local portfolio-db.json
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "src", "lib", "portfolio-db.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const db = JSON.parse(raw);
      if (Array.isArray(db.projects)) {
        const orderMap = new Map(orderList.map((o) => [o.slug.toLowerCase().trim(), o]));
        db.projects.sort((a: any, b: any) => {
          const orderA = orderMap.get(a.slug.toLowerCase())?.order ?? 999;
          const orderB = orderMap.get(b.slug.toLowerCase())?.order ?? 999;
          return orderA - orderB;
        });
        db.projects.forEach((p: any, idx: number) => {
          p.id = String(idx + 1).padStart(2, "0");
          const ord = orderMap.get(p.slug.toLowerCase());
          if (ord && ord.featured !== undefined) {
            p.featured = Boolean(ord.featured);
          }
        });
        await fs.writeFile(filePath, JSON.stringify(db, null, 4), "utf-8");
      }
    } catch (fsErr) {
      console.warn("Reorder JSON sync skipped:", fsErr);
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/projects");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/projects/reorder error:", error);
    return NextResponse.json({ error: "Failed to reorder projects" }, { status: 500 });
  }
}
