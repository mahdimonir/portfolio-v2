"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DashboardFormSkeleton } from "@/components/dashboard/DashboardSkeletons";
import {
    Sliders,
    Save,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Quote,
    Layers,
    FileText,
    Code2,
    Briefcase,
    GraduationCap,
} from "lucide-react";

export interface SectionsCmsData {
    // 1. Hero Copy & Typography
    hero: {
        headline: string;
        headlineSecond: string;
        subheadline: string;
        availability: string;
    };

    // 2. Philosophy & Quote
    quote: {
        text: string;
        author: string;
    };

    // 3. Top Utility Navigation Bar Labels
    topBackLabel: string;
    topResumeLabel: string;
    topContactLabel: string;

    // 4. Section 00 Dossier Metadata
    label: string;
    portraitTag: string;
    portraitStatus: string;

    // 5. Section 01 Work Experience (Chronology)
    experienceBadge: string;
    experienceHeading: string;
    experienceDescription: string;

    // 6. Section 02 Flagship Systems
    projectsBadge: string;
    projectsHeading: string;
    projectsDescription: string;
    projectsArchiveLabel: string;

    // 7. Section 03 Technical Stack & Capabilities
    skillsBadge: string;
    skillsHeading: string;
    skillsDescription: string;

    // 8. Section 04 Engineering Specializations
    specializationsBadge: string;
    specializationsHeading: string;
    specializationsDescription: string;

    // 9. Section 05 Credentials & Academic Background
    credentialsBadge: string;
    credentialsHeading: string;
    credentialsDescription: string;
    educationHeading: string;
    coursesHeading: string;

    // 10. Section 06 Collaboration Callout Banner
    ctaLabel: string;
    ctaHeading: string;
    ctaDescription: string;
    ctaResumeButtonText: string;
    ctaContactButtonText: string;
}

const DEFAULT_SECTIONS: SectionsCmsData = {
    hero: {
        headline: "MAHDI",
        headlineSecond: "moniruzzaman",
        subheadline: "Building robust software, automating the complex and focused on transforming static systems into intelligent ones.",
        availability: "AVAILABLE FOR WORK",
    },
    quote: {
        text: "I build software not just to solve problems, but to create elegant, enduring systems that scale effortlessly.",
        author: "Moniruzzaman Mahdi",
    },
    topBackLabel: "Back To Home",
    topResumeLabel: "Download Resume",
    topContactLabel: "Initiate Contact",
    label: "00 // DOSSIER & PROFILE",
    portraitTag: "ENGINEERING DOSSIER",
    portraitStatus: "STATUS: ACTIVE",
    experienceBadge: "01 // CAREER",
    experienceHeading: "Work Experience",
    experienceDescription: "Production track record across software engineering, client platforms, and high-concurrency systems.",
    projectsBadge: "02 // SYSTEMS",
    projectsHeading: "Flagship Systems",
    projectsDescription: "Production web platforms, SaaS multi-tenancy, and high-performance engines built end-to-end.",
    projectsArchiveLabel: "Archive",
    skillsBadge: "03 // CAPABILITIES",
    skillsHeading: "Technical Stack",
    skillsDescription: "Languages, backend frameworks, relational databases, cloud infrastructure, and tool ecosystem.",
    specializationsBadge: "04 // SPECIALIZATIONS",
    specializationsHeading: "Engineering Specializations",
    specializationsDescription: "In-depth architectural competencies, multi-tenant engineering, rapid zero-to-one MVP delivery, and high-concurrency data systems.",
    credentialsBadge: "05 // CREDENTIALS",
    credentialsHeading: "Education & Certifications",
    credentialsDescription: "Formal academic background, verified industry courses, and cohort training.",
    educationHeading: "Formal Education",
    coursesHeading: "Certifications & Cohorts",
    ctaLabel: "// LET'S COLLABORATE",
    ctaHeading: "Have an architecture or system to build?",
    ctaDescription: "Available for high-impact full-stack roles, system architecture consulting, and rapid MVP engineering.",
    ctaResumeButtonText: "Download PDF Resume",
    ctaContactButtonText: "Initiate Contact",
};

type TabKey = "hero_nav" | "quote" | "about_sections" | "callout";

function SectionsCmsInner() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab") as TabKey | null;

    const [form, setForm] = useState<SectionsCmsData>(DEFAULT_SECTIONS);
    const [savedForm, setSavedForm] = useState<SectionsCmsData>(DEFAULT_SECTIONS);
    const [activeTab, setActiveTab] = useState<TabKey>(
        tabParam && ["hero_nav", "quote", "about_sections", "callout"].includes(tabParam)
            ? tabParam
            : "hero_nav"
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await fetch("/api/portfolio");
            const data = await res.json();
            if (data) {
                const normalized: SectionsCmsData = {
                    hero: {
                        headline: data.hero?.headline || DEFAULT_SECTIONS.hero.headline,
                        headlineSecond: data.hero?.headlineSecond || DEFAULT_SECTIONS.hero.headlineSecond,
                        subheadline: data.hero?.subheadline || DEFAULT_SECTIONS.hero.subheadline,
                        availability: data.hero?.availability || DEFAULT_SECTIONS.hero.availability,
                    },
                    quote: {
                        text: data.quote?.text || DEFAULT_SECTIONS.quote.text,
                        author: data.quote?.author || DEFAULT_SECTIONS.quote.author,
                    },
                    topBackLabel: data.about?.topBackLabel ?? DEFAULT_SECTIONS.topBackLabel,
                    topResumeLabel: data.about?.topResumeLabel ?? DEFAULT_SECTIONS.topResumeLabel,
                    topContactLabel: data.about?.topContactLabel ?? DEFAULT_SECTIONS.topContactLabel,
                    label: data.about?.label || DEFAULT_SECTIONS.label,
                    portraitTag: data.about?.portraitTag ?? DEFAULT_SECTIONS.portraitTag,
                    portraitStatus: data.about?.portraitStatus ?? DEFAULT_SECTIONS.portraitStatus,
                    experienceBadge: data.about?.experienceBadge ?? DEFAULT_SECTIONS.experienceBadge,
                    experienceHeading: data.about?.experienceHeading ?? DEFAULT_SECTIONS.experienceHeading,
                    experienceDescription: data.about?.experienceDescription ?? DEFAULT_SECTIONS.experienceDescription,
                    projectsBadge: data.about?.projectsBadge ?? DEFAULT_SECTIONS.projectsBadge,
                    projectsHeading: data.about?.projectsHeading ?? DEFAULT_SECTIONS.projectsHeading,
                    projectsDescription: data.about?.projectsDescription ?? DEFAULT_SECTIONS.projectsDescription,
                    projectsArchiveLabel: data.about?.projectsArchiveLabel ?? DEFAULT_SECTIONS.projectsArchiveLabel,
                    skillsBadge: data.about?.skillsBadge ?? DEFAULT_SECTIONS.skillsBadge,
                    skillsHeading: data.about?.skillsHeading ?? DEFAULT_SECTIONS.skillsHeading,
                    skillsDescription: data.about?.skillsDescription ?? DEFAULT_SECTIONS.skillsDescription,
                    specializationsBadge: data.about?.specializationsBadge ?? DEFAULT_SECTIONS.specializationsBadge,
                    specializationsHeading: data.about?.specializationsHeading ?? DEFAULT_SECTIONS.specializationsHeading,
                    specializationsDescription: data.about?.specializationsDescription ?? DEFAULT_SECTIONS.specializationsDescription,
                    credentialsBadge: data.about?.credentialsBadge ?? DEFAULT_SECTIONS.credentialsBadge,
                    credentialsHeading: data.about?.credentialsHeading ?? DEFAULT_SECTIONS.credentialsHeading,
                    credentialsDescription: data.about?.credentialsDescription ?? DEFAULT_SECTIONS.credentialsDescription,
                    educationHeading: data.about?.educationHeading ?? DEFAULT_SECTIONS.educationHeading,
                    coursesHeading: data.about?.coursesHeading ?? DEFAULT_SECTIONS.coursesHeading,
                    ctaLabel: data.about?.ctaLabel ?? DEFAULT_SECTIONS.ctaLabel,
                    ctaHeading: data.about?.ctaHeading || DEFAULT_SECTIONS.ctaHeading,
                    ctaDescription: data.about?.ctaDescription || DEFAULT_SECTIONS.ctaDescription,
                    ctaResumeButtonText: data.about?.ctaResumeButtonText ?? DEFAULT_SECTIONS.ctaResumeButtonText,
                    ctaContactButtonText: data.about?.ctaContactButtonText ?? DEFAULT_SECTIONS.ctaContactButtonText,
                };
                setForm(normalized);
                setSavedForm(JSON.parse(JSON.stringify(normalized)));
            }
        } catch (err) {
            console.error("Failed to load sections CMS data:", err);
            toast.error("Failed to load section settings");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                hero: form.hero,
                quote: form.quote,
                about: {
                    topBackLabel: form.topBackLabel,
                    topResumeLabel: form.topResumeLabel,
                    topContactLabel: form.topContactLabel,
                    label: form.label,
                    portraitTag: form.portraitTag,
                    portraitStatus: form.portraitStatus,
                    experienceBadge: form.experienceBadge,
                    experienceHeading: form.experienceHeading,
                    experienceDescription: form.experienceDescription,
                    projectsBadge: form.projectsBadge,
                    projectsHeading: form.projectsHeading,
                    projectsDescription: form.projectsDescription,
                    projectsArchiveLabel: form.projectsArchiveLabel,
                    skillsBadge: form.skillsBadge,
                    skillsHeading: form.skillsHeading,
                    skillsDescription: form.skillsDescription,
                    specializationsBadge: form.specializationsBadge,
                    specializationsHeading: form.specializationsHeading,
                    specializationsDescription: form.specializationsDescription,
                    credentialsBadge: form.credentialsBadge,
                    credentialsHeading: form.credentialsHeading,
                    credentialsDescription: form.credentialsDescription,
                    educationHeading: form.educationHeading,
                    coursesHeading: form.coursesHeading,
                    ctaLabel: form.ctaLabel,
                    ctaHeading: form.ctaHeading,
                    ctaDescription: form.ctaDescription,
                    ctaResumeButtonText: form.ctaResumeButtonText,
                    ctaContactButtonText: form.ctaContactButtonText,
                },
            };

            const res = await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setSavedForm(JSON.parse(JSON.stringify(form)));
                toast.success("All section headings, badges, and button labels saved!");
            } else {
                toast.error("Failed to save sections copy.");
            }
        } catch {
            toast.error("Network error while saving.");
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if (confirm("Discard unsaved changes to sections copy?")) {
            setForm(JSON.parse(JSON.stringify(savedForm)));
            toast.info("Reverted unsaved changes");
        }
    };

    // Keyboard shortcut Ctrl+S
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                if (isDirty && !saving) handleSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    const inputClass =
        "w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all";
    const labelClass =
        "text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between";

    if (loading) {
        return <DashboardFormSkeleton title="CMS & Sections UI" />;
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Header & Save Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        CMS &amp; Sections UI Manager
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
                        Dedicated CMS to manage every section title, overline badge, descriptive subtitle, and button text across the site.
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
                                <span>Save Sections Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Segmented Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("hero_nav")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeTab === "hero_nav"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Hero &amp; Navigation UI</span>
                </button>

                <button
                    onClick={() => setActiveTab("quote")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeTab === "quote"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Quote className="w-4 h-4 text-cyan-400" />
                    <span>Philosophy &amp; Quote</span>
                </button>

                <button
                    onClick={() => setActiveTab("about_sections")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeTab === "about_sections"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>About Page Sections (00 - 05)</span>
                </button>

                <button
                    onClick={() => setActiveTab("callout")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeTab === "callout"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    <span>06 // Collaboration Callout</span>
                </button>
            </div>

            {/* TAB 1: HERO & NAVIGATION */}
            {activeTab === "hero_nav" && (
                <div className="flex flex-col gap-6">
                    {/* Top Navigation Bar Buttons */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-cyan-400" />
                                <span>Top Utility Bar Button Labels (/about)</span>
                            </h2>
                            <span className="text-[11px] font-mono text-zinc-500">
                                Controls top action links on the About page
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClass}>Back Link Label</label>
                                <input
                                    className={inputClass}
                                    value={form.topBackLabel}
                                    onChange={(e) => setForm({ ...form, topBackLabel: e.target.value })}
                                    placeholder="Back To Home"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Resume Download Button Text</label>
                                <input
                                    className={inputClass}
                                    value={form.topResumeLabel}
                                    onChange={(e) => setForm({ ...form, topResumeLabel: e.target.value })}
                                    placeholder="Download Resume"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Contact Action Button Text</label>
                                <input
                                    className={inputClass}
                                    value={form.topContactLabel}
                                    onChange={(e) => setForm({ ...form, topContactLabel: e.target.value })}
                                    placeholder="Initiate Contact"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Homepage Hero Typography */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span>Homepage Hero Headlines &amp; Status</span>
                            </h2>
                            <span className="text-[11px] font-mono text-zinc-500">
                                Rendered in the main Hero section on the homepage
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Hero Huge Word 1</label>
                                <input
                                    className={inputClass + " font-black text-lg"}
                                    value={form.hero.headline}
                                    onChange={(e) =>
                                        setForm({ ...form, hero: { ...form.hero, headline: e.target.value } })
                                    }
                                    placeholder="MAHDI"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Hero Huge Word 2</label>
                                <input
                                    className={inputClass + " font-black text-lg"}
                                    value={form.hero.headlineSecond}
                                    onChange={(e) =>
                                        setForm({ ...form, hero: { ...form.hero, headlineSecond: e.target.value } })
                                    }
                                    placeholder="moniruzzaman"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Hero Subheadline Narrative</label>
                                <textarea
                                    rows={2}
                                    className={inputClass}
                                    value={form.hero.subheadline}
                                    onChange={(e) =>
                                        setForm({ ...form, hero: { ...form.hero, subheadline: e.target.value } })
                                    }
                                    placeholder="Building robust software, automating the complex and focused on transforming static systems into intelligent ones."
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Hero Status Availability Badge</label>
                                <input
                                    className={inputClass}
                                    value={form.hero.availability}
                                    onChange={(e) =>
                                        setForm({ ...form, hero: { ...form.hero, availability: e.target.value } })
                                    }
                                    placeholder="AVAILABLE FOR WORK"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: PHILOSOPHY & QUOTE */}
            {activeTab === "quote" && (
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <Quote className="w-4 h-4 text-cyan-400" />
                            <span>Philosophy &amp; Quote Section Copy</span>
                        </h2>
                        <span className="text-[11px] font-mono text-zinc-500">
                            Rendered in the dedicated Philosophy section on the homepage
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Philosophy Quote Statement</label>
                            <textarea
                                rows={3}
                                className={inputClass + " text-base font-semibold"}
                                value={form.quote.text}
                                onChange={(e) =>
                                    setForm({ ...form, quote: { ...form.quote, text: e.target.value } })
                                }
                                placeholder="I build software not just to solve problems, but to create elegant, enduring systems that scale effortlessly."
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Quote Author Attribution</label>
                            <input
                                className={inputClass}
                                value={form.quote.author}
                                onChange={(e) =>
                                    setForm({ ...form, quote: { ...form.quote, author: e.target.value } })
                                }
                                placeholder="Moniruzzaman Mahdi"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: ABOUT PAGE SECTIONS (00 - 05) */}
            {activeTab === "about_sections" && (
                <div className="flex flex-col gap-6">
                    {/* 00 Dossier */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800/70 pb-3">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <span>Section 00 // Dossier &amp; Portrait Badges</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Section Overline Badge</label>
                                <input
                                    className={inputClass}
                                    value={form.label}
                                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                                    placeholder="00 // DOSSIER & PROFILE"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Portrait Card Tag (Left)</label>
                                <input
                                    className={inputClass}
                                    value={form.portraitTag}
                                    onChange={(e) => setForm({ ...form, portraitTag: e.target.value })}
                                    placeholder="ENGINEERING DOSSIER"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Portrait Status Badge (Right)</label>
                                <input
                                    className={inputClass}
                                    value={form.portraitStatus}
                                    onChange={(e) => setForm({ ...form, portraitStatus: e.target.value })}
                                    placeholder="STATUS: ACTIVE"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 01 Work Experience */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800/70 pb-3">
                            <Briefcase className="w-4 h-4 text-cyan-400" />
                            <span>Section 01 // Work Experience (Chronology)</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Overline Badge</label>
                                <input
                                    className={inputClass}
                                    value={form.experienceBadge}
                                    onChange={(e) => setForm({ ...form, experienceBadge: e.target.value })}
                                    placeholder="01 // CAREER"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Heading / Title</label>
                                <input
                                    className={inputClass}
                                    value={form.experienceHeading}
                                    onChange={(e) => setForm({ ...form, experienceHeading: e.target.value })}
                                    placeholder="Work Experience"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Descriptive Subtitle</label>
                            <textarea
                                rows={2}
                                className={inputClass}
                                value={form.experienceDescription}
                                onChange={(e) => setForm({ ...form, experienceDescription: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* 02 Flagship Systems */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800/70 pb-3">
                            <Code2 className="w-4 h-4 text-cyan-400" />
                            <span>Section 02 // Flagship Systems</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Overline Badge</label>
                                <input
                                    className={inputClass}
                                    value={form.projectsBadge}
                                    onChange={(e) => setForm({ ...form, projectsBadge: e.target.value })}
                                    placeholder="02 // SYSTEMS"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Heading / Title</label>
                                <input
                                    className={inputClass}
                                    value={form.projectsHeading}
                                    onChange={(e) => setForm({ ...form, projectsHeading: e.target.value })}
                                    placeholder="Flagship Systems"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Archive Link Label</label>
                                <input
                                    className={inputClass}
                                    value={form.projectsArchiveLabel}
                                    onChange={(e) => setForm({ ...form, projectsArchiveLabel: e.target.value })}
                                    placeholder="Archive"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Descriptive Subtitle</label>
                            <textarea
                                rows={2}
                                className={inputClass}
                                value={form.projectsDescription}
                                onChange={(e) => setForm({ ...form, projectsDescription: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* 03 Capabilities */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800/70 pb-3">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <span>Section 03 // Technical Stack &amp; Capabilities</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Overline Badge</label>
                                <input
                                    className={inputClass}
                                    value={form.skillsBadge}
                                    onChange={(e) => setForm({ ...form, skillsBadge: e.target.value })}
                                    placeholder="03 // CAPABILITIES"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Heading / Title</label>
                                <input
                                    className={inputClass}
                                    value={form.skillsHeading}
                                    onChange={(e) => setForm({ ...form, skillsHeading: e.target.value })}
                                    placeholder="Technical Stack"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Descriptive Subtitle</label>
                            <textarea
                                rows={2}
                                className={inputClass}
                                value={form.skillsDescription}
                                onChange={(e) => setForm({ ...form, skillsDescription: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* 04 Specializations */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800/70 pb-3">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <span>Section 04 // Engineering Specializations / Services</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Overline Badge</label>
                                <input
                                    className={inputClass}
                                    value={form.specializationsBadge}
                                    onChange={(e) => setForm({ ...form, specializationsBadge: e.target.value })}
                                    placeholder="04 // SPECIALIZATIONS"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Heading / Title</label>
                                <input
                                    className={inputClass}
                                    value={form.specializationsHeading}
                                    onChange={(e) => setForm({ ...form, specializationsHeading: e.target.value })}
                                    placeholder="Engineering Specializations"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Descriptive Subtitle</label>
                            <textarea
                                rows={2}
                                className={inputClass}
                                value={form.specializationsDescription}
                                onChange={(e) => setForm({ ...form, specializationsDescription: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* 05 Credentials & Education */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800/70 pb-3">
                            <GraduationCap className="w-4 h-4 text-cyan-400" />
                            <span>Section 05 // Education &amp; Credentials</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Overline Badge</label>
                                <input
                                    className={inputClass}
                                    value={form.credentialsBadge}
                                    onChange={(e) => setForm({ ...form, credentialsBadge: e.target.value })}
                                    placeholder="05 // CREDENTIALS"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Heading / Title</label>
                                <input
                                    className={inputClass}
                                    value={form.credentialsHeading}
                                    onChange={(e) => setForm({ ...form, credentialsHeading: e.target.value })}
                                    placeholder="Education & Certifications"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Descriptive Subtitle</label>
                            <textarea
                                rows={2}
                                className={inputClass}
                                value={form.credentialsDescription}
                                onChange={(e) => setForm({ ...form, credentialsDescription: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className={labelClass}>Formal Education Column Title</label>
                                <input
                                    className={inputClass}
                                    value={form.educationHeading}
                                    onChange={(e) => setForm({ ...form, educationHeading: e.target.value })}
                                    placeholder="Formal Education"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Certifications Column Title</label>
                                <input
                                    className={inputClass}
                                    value={form.coursesHeading}
                                    onChange={(e) => setForm({ ...form, coursesHeading: e.target.value })}
                                    placeholder="Certifications & Cohorts"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: COLLABORATION CALLOUT */}
            {activeTab === "callout" && (
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <span>Section 06 // Collaboration Callout Banner</span>
                        </h2>
                        <span className="text-[11px] font-mono text-zinc-500">
                            Full-width banner at the footer of /about
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={labelClass}>Callout Overline Badge</label>
                            <input
                                className={inputClass}
                                value={form.ctaLabel}
                                onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                                placeholder="// LET'S COLLABORATE"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClass}>Banner Headline</label>
                            <input
                                className={inputClass}
                                value={form.ctaHeading}
                                onChange={(e) => setForm({ ...form, ctaHeading: e.target.value })}
                                placeholder="Have an architecture or system to build?"
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Banner Subtitle / Description</label>
                        <textarea
                            rows={2}
                            className={inputClass}
                            value={form.ctaDescription}
                            onChange={(e) => setForm({ ...form, ctaDescription: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div>
                            <label className={labelClass}>Resume Button Text</label>
                            <input
                                className={inputClass}
                                value={form.ctaResumeButtonText}
                                onChange={(e) => setForm({ ...form, ctaResumeButtonText: e.target.value })}
                                placeholder="Download PDF Resume"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Contact Button Text</label>
                            <input
                                className={inputClass}
                                value={form.ctaContactButtonText}
                                onChange={(e) => setForm({ ...form, ctaContactButtonText: e.target.value })}
                                placeholder="Initiate Contact"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SectionsCmsPage() {
    return (
        <Suspense fallback={<DashboardFormSkeleton title="CMS & Sections UI" />}>
            <SectionsCmsInner />
        </Suspense>
    );
}
