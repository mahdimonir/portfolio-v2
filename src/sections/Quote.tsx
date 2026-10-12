"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePortfolioData } from "@/lib/PortfolioContext";

interface QuoteProps {
    className?: string;
    showLabel?: boolean;
}

export default function Quote({ className = "", showLabel = true }: QuoteProps) {
    const data = usePortfolioData();
    const quoteText =
        data.quote?.text ||
        "I build software not just to solve problems, but to create elegant, enduring systems that scale effortlessly.";
    const quoteAuthor = data.quote?.author || data.name || "Moniruzzaman Mahdi";

    return (
        <section className={`w-full ${className}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-y-8"
            >
                {showLabel && (
                    <div className="md:col-span-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-zinc-500 block">
                            Philosophy
                        </span>
                    </div>
                )}
                <div className={showLabel ? "md:col-span-4" : "col-span-full"}>
                    <blockquote className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase leading-tight tracking-tight select-none">
                        &ldquo;{quoteText}&rdquo;
                    </blockquote>
                    <p className="mt-6 font-mono text-sm uppercase tracking-[0.2em] text-zinc-600 font-bold">
                        — {quoteAuthor}
                    </p>
                </div>
            </motion.div>
        </section>
    );
}
