import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendContactNotification } from "@/lib/mail";
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

// POST: Public submission of contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName = "", email, subject = "", message } = body;

    if (!firstName?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Please provide your name, email, and message." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const senderName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // 1. Save to Neon PostgreSQL database
    try {
      await sql`
        INSERT INTO contact_messages (name, email, subject, message)
        VALUES (${senderName}, ${email.trim()}, ${subject.trim()}, ${message.trim()})
      `;
    } catch (dbError) {
      console.error("Database save contact error (non-fatal):", dbError);
    }

    // 2. Send email notification via Gmail SMTP
    try {
      await sendContactNotification({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
    } catch (mailError) {
      console.error("SMTP sending error:", mailError);
      return NextResponse.json(
        { error: "Failed to dispatch email. Please try again shortly or contact directly." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}

// GET: Admin-only retrieval of contact messages
export async function GET(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const messages = await sql`
      SELECT id, name, email, subject, message, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET contact messages error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve messages" },
      { status: 500 }
    );
  }
}
