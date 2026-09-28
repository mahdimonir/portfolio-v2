"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Dashboard</h1>
        <p className="text-xs text-white/40 mb-8 uppercase tracking-wider">Sign in to edit your portfolio</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 py-2 text-sm font-medium focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
              placeholder="admin"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 py-2 text-sm font-medium focus:border-white focus:outline-none transition-colors placeholder:text-white/20"
              placeholder="••••••"
              required
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 text-xs font-black uppercase tracking-[0.15em] hover:bg-white/90 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <a href="/" className="block text-center text-[10px] text-white/30 uppercase tracking-wider mt-8 hover:text-white/60 transition-colors">
          ← Back to Portfolio
        </a>
      </div>
    </div>
  );
}
