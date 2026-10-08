"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { DashboardFormSkeleton } from "@/components/dashboard/DashboardSkeletons";
import {
    Quote,
    Save,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    Sparkles,
} from "lucide-react";

export interface QuoteData {
    text: string;
    author: string;
}

export default function QuoteDashboardPage() {
    const [quote, setQuote] = useState<QuoteData>({ text: "", author: "" });
    const [savedQuote, setSavedQuote] = useState<QuoteData>({ text: "", author: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await fetch("/api/portfolio?scope=quote");
            const data = await res.json();
            if (data?.quote) {
                setQuote(data.quote);
                setSavedQuote(JSON.parse(JSON.stringify(data.quote)));
            }
        } catch (err) {
            console.error("Failed to load quote:", err);
            toast.error("Failed to load quote");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isDirty = JSON.stringify(quote) !== JSON.stringify(savedQuote);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Fast sub-20ms PATCH for quote
            const res = await fetch("/api/portfolio", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ quote }),
            });

            if (res.ok) {
                setSavedQuote(JSON.parse(JSON.stringify(quote)));
                toast.success("Quote & philosophy updated in database!");
            } else {
                toast.error("Failed to save quote.");
            }
        } catch {
            toast.error("Network error while saving.");
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if (confirm("Discard unsaved quote changes?")) {
            setQuote(JSON.parse(JSON.stringify(savedQuote)));
            toast.info("Reverted changes");
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSave]);

    const inputClass =
        "w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all";
    const labelClass =
        "text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between";

    if (loading) {
        return <DashboardFormSkeleton title="Philosophy & Quote" />;
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        Philosophy & Quote
                        {isDirty ? (
                            <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Unsaved
                            </span>
                        ) : (
                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Synced
                            </span>
                        )}
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Configure the primary philosophical statement featured across your portfolio.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {isDirty && (
                        <button
                            onClick={handleDiscard}
                            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white px-3 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Discard
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                            !isDirty
                                ? "bg-zinc-800 text-zinc-500 cursor-default"
                                : "bg-white text-black hover:bg-zinc-200"
                        }`}
                    >
                        {saving ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Statement</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 2-Column Split: Form & Live Public Section Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
                {/* Inputs (5 cols) */}
                <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                        <Quote className="w-4 h-4 text-zinc-300" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                            Quote Parameters
                        </h2>
                    </div>

                    <div>
                        <label className={labelClass}>Quote Statement</label>
                        <textarea
                            className={inputClass + " resize-y min-h-[140px] text-base leading-relaxed"}
                            rows={5}
                            value={quote.text}
                            onChange={(e) => setQuote({ ...quote, text: e.target.value })}
                            placeholder="The function of good software is to make the complex appear to be simple."
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Attributed Author / Figure</label>
                        <input
                            className={inputClass + " font-bold"}
                            value={quote.author}
                            onChange={(e) => setQuote({ ...quote, author: e.target.value })}
                            placeholder="Grady Booch"
                        />
                    </div>
                </div>

                {/* High Contrast Public Banner Preview (7 cols) */}
                <div className="lg:col-span-7 bg-white text-black rounded-2xl p-8 sm:p-12 shadow-2xl border border-zinc-200 flex flex-col justify-center min-h-[360px]">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 font-mono">
                        Live Public Site Rendering
                    </span>
                    <blockquote className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase leading-tight tracking-tight text-black">
                        "{quote.text || "Your philosophy statement will appear here."}"
                    </blockquote>
                    <p className="mt-8 text-base font-bold text-zinc-600 uppercase tracking-wider">
                        — {quote.author || "Author"}
                    </p>
                </div>
            </div>
        </div>
    );
}
