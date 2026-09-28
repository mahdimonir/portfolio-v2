"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "forgot-request" | "forgot-reset";

export default function LoginPage() {
    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Reset errors/info on mode switch
    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setError("");
        setInfo("");
        setOtp("");
        setNewPassword("");
    };

    // 1. Email + Password Login
    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setInfo("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push("/dashboard");
            } else {
                setError(data.error || "Invalid email or password.");
            }
        } catch {
            setError("Network or server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Request OTP for Password Reset
    const handleRequestResetOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setInfo("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setInfo("A 6-digit verification code was sent to your email.");
                setMode("forgot-reset");
            } else {
                setError(data.error || "Failed to send reset code.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Verify OTP & Set New Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setInfo("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setInfo("Password reset successful! Logging you in...");
                // Auto-login with the new password
                const loginRes = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password: newPassword }),
                });
                const loginData = await loginRes.json();
                if (loginRes.ok && loginData.success) {
                    router.push("/dashboard");
                    return;
                }
                // If auto-login fails, return to login form
                setPassword(newPassword);
                switchMode("login");
            } else {
                setError(data.error || "Failed to reset password.");
            }
        } catch {
            setError("Something went wrong during reset.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center px-6">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="mb-8">
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30 mb-2">// SECURE ACCESS</p>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Dashboard</h1>
                    <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">
                        {mode === "login" && "Sign in with your email and password"}
                        {mode === "forgot-request" && "Enter your admin email to receive a reset code"}
                        {mode === "forgot-reset" && "Enter the 6-digit code and your new password"}
                    </p>
                </div>

                {/* Feedback Messages */}
                {info && (
                    <p className="mb-4 text-xs text-emerald-400 font-mono tracking-wide border border-emerald-500/20 bg-emerald-950/20 px-3 py-2">
                        {info}
                    </p>
                )}
                {error && (
                    <p className="mb-4 text-xs text-red-400 font-mono tracking-wide border border-red-500/20 bg-red-950/20 px-3 py-2">
                        {error}
                    </p>
                )}

                {/* MODE 1: Email + Password Login */}
                {mode === "login" && (
                    <form onSubmit={handlePasswordLogin} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-white/20 py-2 text-sm font-medium focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
                                placeholder="example@email.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Password</label>
                                <button
                                    type="button"
                                    onClick={() => switchMode("forgot-request")}
                                    className="text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-wider"
                                >
                                    Forgot?
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-b border-white/20 py-2 text-sm font-medium focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
                                placeholder="••••••••••••"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-3 text-xs font-black uppercase tracking-[0.15em] hover:bg-white/90 transition-colors disabled:opacity-50 mt-2"
                        >
                            {loading ? "Authenticating..." : "Sign In →"}
                        </button>
                    </form>
                )}

                {/* MODE 2: Request Reset OTP */}
                {mode === "forgot-request" && (
                    <form onSubmit={handleRequestResetOTP} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Admin Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-white/20 py-2 text-sm font-medium focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
                                placeholder="example@email.com"
                                required
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-3 text-xs font-black uppercase tracking-[0.15em] hover:bg-white/90 transition-colors disabled:opacity-50 mt-2"
                        >
                            {loading ? "Sending Code..." : "Send Verification Code →"}
                        </button>

                        <button
                            type="button"
                            onClick={() => switchMode("login")}
                            className="text-center text-[10px] text-white/40 uppercase tracking-wider hover:text-white transition-colors"
                        >
                            ← Back to Sign In
                        </button>
                    </form>
                )}

                {/* MODE 3: Verify OTP & Set New Password */}
                {mode === "forgot-reset" && (
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                                6-Digit Verification Code
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-mono font-bold tracking-[0.3em] focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
                                placeholder="000000"
                                required
                                autoComplete="one-time-code"
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-transparent border-b border-white/20 py-2 text-sm font-medium focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
                                placeholder="Minimum 6 characters"
                                minLength={6}
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6 || newPassword.length < 6}
                            className="w-full bg-white text-black py-3 text-xs font-black uppercase tracking-[0.15em] hover:bg-white/90 transition-colors disabled:opacity-50 mt-2"
                        >
                            {loading ? "Updating..." : "Update Password & Sign In →"}
                        </button>

                        <button
                            type="button"
                            onClick={() => switchMode("login")}
                            className="text-center text-[10px] text-white/40 uppercase tracking-wider hover:text-white transition-colors"
                        >
                            ← Cancel & Back to Sign In
                        </button>
                    </form>
                )}

                <a
                    href="/"
                    className="block text-center text-[10px] text-white/30 uppercase tracking-wider mt-8 hover:text-white/60 transition-colors"
                >
                    ← Back to Portfolio
                </a>
            </div>
        </div>
    );
}
