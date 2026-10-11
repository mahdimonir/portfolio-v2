import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInquiryReply } from "@/lib/mail";
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

// POST: Admin dispatches direct reply email to contact inquiry
export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, to, recipientName, subject, message, originalMessage } = body;

    if (!to?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Recipient email and reply message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to.trim())) {
      return NextResponse.json(
        { error: "Invalid recipient email address." },
        { status: 400 }
      );
    }

    // 1. Send reply email via Gmail SMTP
    await sendInquiryReply({
      to: to.trim(),
      recipientName: recipientName?.trim() || "Client",
      subject: subject?.trim() || "Re: Your Portfolio Inquiry",
      message: message.trim(),
      originalMessage: originalMessage?.trim(),
    });

    // 2. If message ID provided, mark as read automatically
    if (id) {
      try {
        await prisma.contactMessage.update({
          where: { id: Number(id) },
          data: { read: true },
        });
      } catch (dbErr) {
        console.error("Non-fatal: Failed to mark message read after reply:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reply sent successfully to ${to.trim()}!`,
    });
  } catch (error) {
    console.error("Inquiry reply dispatch error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch email reply. Please check SMTP configuration." },
      { status: 500 }
    );
  }
}
