import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { jwtVerify } from "jose";
import fallbackDb from "@/lib/portfolio-db.json";

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

export async function GET() {
  try {
    const rows = await sql`SELECT data FROM portfolio ORDER BY id LIMIT 1`;
    if (rows.length > 0 && rows[0].data) {
      return NextResponse.json(rows[0].data);
    }
    // Fall back to local json if DB is empty
    return NextResponse.json(fallbackDb);
  } catch (error) {
    console.error("GET portfolio error, falling back to local JSON:", error);
    return NextResponse.json(fallbackDb);
  }
}

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // 1. Save to Neon PostgreSQL
    const existing = await sql`SELECT id FROM portfolio ORDER BY id LIMIT 1`;
    if (existing.length === 0) {
      await sql`INSERT INTO portfolio (data) VALUES (${JSON.stringify(body)})`;
    } else {
      await sql`UPDATE portfolio SET data = ${JSON.stringify(body)}, updated_at = NOW() WHERE id = ${existing[0].id}`;
    }

    // 2. Synchronize to local JSON file for local build / server-side imports
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "src", "lib", "portfolio-db.json");
      await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf-8");
    } catch (fsErr) {
      console.warn("Local JSON file sync skipped:", fsErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST portfolio error:", error);
    return NextResponse.json({ error: "Failed to save portfolio data" }, { status: 500 });
  }
}
