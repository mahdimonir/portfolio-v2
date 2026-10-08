import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Moniruzzaman Mahdi",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white font-sans px-6 text-center select-none">
      <div className="max-w-md space-y-6">
        <span className="text-xs font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase block">
          // ERROR 404
        </span>
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter">
          404
        </h1>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
          The requested page or case study does not exist or has been archived.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors"
          >
            <span>Return to Portfolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
