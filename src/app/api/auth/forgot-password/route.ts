import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/mail";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/forgot-password — send OTP for password reset
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email address is required" }, { status: 400 });
        }

        const cleanEmail = email.toLowerCase().trim();
        const authorizedEmail = (process.env.ADMIN_EMAIL || process.env.SMTP_USER || "").toLowerCase().trim();

        if (!authorizedEmail || cleanEmail !== authorizedEmail) {
            return NextResponse.json({ error: "Access denied. Only the site administrator is authorized." }, { status: 403 });
        }

        // Verify user exists in DB
        const user = await prisma.user.findFirst({
            where: { email: cleanEmail },
        });

        if (!user) {
            return NextResponse.json({ error: "Admin account not found in system." }, { status: 404 });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_TTL_MS);

        // Save to otp_verifications table
        await prisma.otpVerification.create({
            data: {
                email: cleanEmail,
                code: otp,
                action: "password_reset",
                expiresAt,
                used: false,
            },
        });

        // Send email
        await sendOTPEmail({
            to: cleanEmail,
            otp,
            title: "Password Reset Verification",
            sub: "Security One-Time Code",
            purpose:
                "You requested to reset your dashboard password. Enter this 6-digit verification code along with your new password. It expires in <strong>10 minutes</strong>.",
        });

        return NextResponse.json({
            success: true,
            message: "Verification code sent to your email.",
        });
    } catch (error) {
        console.error("Forgot password OTP error:", error);
        return NextResponse.json({ error: "Failed to generate or send verification code" }, { status: 500 });
    }
}
