import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super_secret_portfolio_jwt_key_2026_secure"
);

// GET /api/auth/verify — verify JWT session from cookie
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({
      authenticated: true,
      user: { id: payload.sub, email: payload.email },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// POST /api/auth/verify — also support POST for clients calling POST /api/auth/verify
export async function POST(request: NextRequest) {
  return GET(request);
}
