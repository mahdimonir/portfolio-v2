import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // 1. Save to ContactMessage table via Prisma
    try {
      await prisma.contactMessage.create({
        data: {
          name: senderName,
          email: email.trim(),
          subject: subject?.trim() || null,
          message: message.trim(),
          read: false,
        },
      });
    } catch (dbError) {
      console.error("Database save contact error (non-fatal):", dbError);
    }

    // 2. Dispatch email notification via Gmail SMTP
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
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("GET contact messages error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve messages" },
      { status: 500 }
    );
  }
}

// PATCH: Mark contact message as read/unread or mark all read
export async function PATCH(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Bulk update: Mark all unread as read
    if (body.allRead) {
      const result = await prisma.contactMessage.updateMany({
        where: { read: false },
        data: { read: true },
      });
      return NextResponse.json({
        success: true,
        count: result.count,
        message: "All unread messages marked as read",
      });
    }

    const { id, read } = body;
    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const updated = await prisma.contactMessage.update({
      where: { id: Number(id) },
      data: { read: Boolean(read) },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error("PATCH contact message error:", error);
    return NextResponse.json(
      { error: "Failed to update message status" },
      { status: 500 }
    );
  }
}

// DELETE: Delete contact message
export async function DELETE(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    await prisma.contactMessage.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE contact message error:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
