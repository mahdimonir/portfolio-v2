"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { DashboardFormSkeleton } from "@/components/dashboard/DashboardSkeletons";
import {
    Briefcase,
    GraduationCap,
    Award,
    Plus,
    Trash2,
    Save,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Layers,
    X,
    FileText,
    ExternalLink,
} from "lucide-react";

export interface Experience {
    company: string;
    role: string;
    period: string;
    location?: string | null;
    current?: boolean;
    companyUrl?: string | null;
    companyLogo?: string | null;
    description?: string | null;
    achievements: string[];
}

export interface Education {
    degree: string;
    institution: string;
    period: string;
    current?: boolean;
}

export interface Course {
    title: string;
    institution: string;
    period: string;
    certificateUrl?: string | null;
    completed?: boolean;
}

export interface SpecializationItem {
    id?: string;
    title: string;
    description: string;
    skills?: string[];
    points?: string[];
}

export interface AboutData {
    label: string;
    summary?: string;
    avatarUrl?: string;
    resumeUrl?: string;
    ctaHeading?: string;
    ctaDescription?: string;
    education: Education[];
    experience: Experience[];
    courses: Course[];
    focus: string[];
    specializations: SpecializationItem[];
}

type SubSection = "overview" | "specializations" | "experience" | "education" | "courses";

export default function AboutDashboardPage() {
    const [about, setAbout] = useState<AboutData>({
        label: "00 // DOSSIER & PROFILE",
        summary: "",
        avatarUrl: "/Moniruzzaman_Mahdi.png",
        resumeUrl: "/Moniruzzaman_Mahdi_Full_Stack_Developer.pdf",
        ctaHeading: "Have an architecture or system to build?",
        ctaDescription:
            "Available for high-impact full-stack roles, system architecture consulting, and rapid MVP engineering.",
        education: [],
        experience: [],
        courses: [],
        focus: [],
        specializations: [],
    });
    const [savedAbout, setSavedAbout] = useState<AboutData>({
        label: "00 // DOSSIER & PROFILE",
        summary: "",
        avatarUrl: "/Moniruzzaman_Mahdi.png",
        resumeUrl: "/Moniruzzaman_Mahdi_Full_Stack_Developer.pdf",
        ctaHeading: "Have an architecture or system to build?",
        ctaDescription:
            "Available for high-impact full-stack roles, system architecture consulting, and rapid MVP engineering.",
        education: [],
        experience: [],
        courses: [],
        focus: [],
        specializations: [],
    });

    const [activeSection, setActiveSection] = useState<SubSection>("overview");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load data (scoped to about section)
    const loadData = useCallback(async () => {
        try {
            const res = await fetch("/api/portfolio?scope=about");
            const data = await res.json();
            if (data?.about) {
                const rawSpecs = Array.isArray(data.about.specializations)
                    ? data.about.specializations
                    : [];

                const normalized: AboutData = {
                    label: data.about.label || "00 // DOSSIER & PROFILE",
                    summary: data.about.summary || "",
                    avatarUrl: data.about.avatarUrl || "/Moniruzzaman_Mahdi.png",
                    resumeUrl:
                        data.resumeUrl ||
                        data.about.resumeUrl ||
                        "/Moniruzzaman_Mahdi_Full_Stack_Developer.pdf",
                    ctaHeading: data.about.ctaHeading || "Have an architecture or system to build?",
                    ctaDescription:
                        data.about.ctaDescription ||
                        "Available for high-impact full-stack roles, system architecture consulting, and rapid MVP engineering.",
                    education: Array.isArray(data.about.education) ? data.about.education : [],
                    experience: Array.isArray(data.about.experience) ? data.about.experience : [],
                    courses: Array.isArray(data.about.courses) ? data.about.courses : [],
                    focus: Array.isArray(data.about.focus) ? data.about.focus : [],
                    specializations: rawSpecs.map((s: any, idx: number) => ({
                        id: s.id || `spec-${idx + 1}`,
                        title: s.title || "Specialization",
                        description: s.description || "",
                        skills: Array.isArray(s.skills) ? s.skills : [],
                        points: Array.isArray(s.points) ? s.points : [],
                    })),
                };
                setAbout(normalized);
                setSavedAbout(JSON.parse(JSON.stringify(normalized)));
            }
        } catch (err) {
            console.error("Error loading about data:", err);
            toast.error("Failed to load about data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isDirty = JSON.stringify(about) !== JSON.stringify(savedAbout);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Keep legacy focus synced with specialization titles
            const payload = {
                resumeUrl: about.resumeUrl,
                about: {
                    ...about,
                    focus: about.specializations.map((s) => s.title),
                },
            };

            const res = await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setSavedAbout(JSON.parse(JSON.stringify(about)));
                toast.success("All About milestones, specializations & settings saved!");
            } else {
                toast.error("Failed to save changes.");
            }
        } catch {
            toast.error("Network error while saving.");
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if (confirm("Discard all unsaved changes in About & Career?")) {
            setAbout(JSON.parse(JSON.stringify(savedAbout)));
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

    // Helper modifiers
    const addExperience = () => {
        setAbout((prev) => ({
            ...prev,
            experience: [
                {
                    company: "Company Name",
                    role: "Full Stack Developer",
                    period: "2026 – Present",
                    location: "Remote",
                    current: true,
                    companyUrl: "https://",
                    companyLogo: "",
                    description: "Key contributions, backend services, and interface development.",
                    achievements: ["Architected core production APIs"],
                },
                ...prev.experience,
            ],
        }));
        toast.info("Added work experience entry");
    };

    const addEducation = () => {
        setAbout((prev) => ({
            ...prev,
            education: [
                {
                    institution: "Institution Name",
                    degree: "Bachelor of Science",
                    period: "2025 – Present",
                    current: true,
                },
                ...prev.education,
            ],
        }));
        toast.info("Added education entry");
    };

    const addCourse = () => {
        setAbout((prev) => ({
            ...prev,
            courses: [
                {
                    title: "Certification Title",
                    institution: "Platform / Institute",
                    period: "2026",
                    certificateUrl: "https://",
                    completed: true,
                },
                ...prev.courses,
            ],
        }));
        toast.info("Added course entry");
    };

    const addSpecialization = () => {
        setAbout((prev) => ({
            ...prev,
            specializations: [
                {
                    id: `spec-${Date.now()}`,
                    title: "New Engineering Specialization",
                    description: "Architectural overview and technical execution details.",
                    skills: ["TypeScript", "Next.js", "PostgreSQL"],
                    points: ["Architectural deliverable or system benchmark"],
                },
                ...prev.specializations,
            ],
        }));
        toast.info("Added engineering specialization");
    };

    const inputClass =
        "w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all";
    const labelClass =
        "text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between";

    if (loading) {
        return <DashboardFormSkeleton title="About & Career" />;
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Header & Save Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        About &amp; Career Milestones
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
                        Manage your executive narrative, detailed engineering specializations, work history, formal education, and certifications.
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
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Segmented Section Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto">
                <button
                    onClick={() => setActiveSection("overview")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeSection === "overview"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    <span>Overview &amp; Profile</span>
                </button>

                <button
                    onClick={() => setActiveSection("specializations")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeSection === "specializations"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Specializations ({about.specializations.length})</span>
                </button>

                <button
                    onClick={() => setActiveSection("experience")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeSection === "experience"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Briefcase className="w-4 h-4" />
                    <span>Work Experience ({about.experience.length})</span>
                </button>

                <button
                    onClick={() => setActiveSection("education")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeSection === "education"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <GraduationCap className="w-4 h-4" />
                    <span>Formal Education ({about.education.length})</span>
                </button>

                <button
                    onClick={() => setActiveSection("courses")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeSection === "courses"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Award className="w-4 h-4" />
                    <span>Verified Courses ({about.courses.length})</span>
                </button>
            </div>

            {/* ========================================================================= */}
            {/* SUB-SECTION 1: OVERVIEW & PAGE SETTINGS */}
            {/* ========================================================================= */}
            {activeSection === "overview" && (
                <div className="flex flex-col gap-6">
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span>Hero Narrative &amp; Label</span>
                            </h2>
                            <span className="text-[11px] font-mono text-zinc-500">
                                Displayed in the top profile header of /about
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClass}>Section Overline Label</label>
                                <input
                                    className={inputClass}
                                    value={about.label}
                                    onChange={(e) => setAbout({ ...about, label: e.target.value })}
                                    placeholder="00 // DOSSIER & PROFILE"
                                />
                                <p className="text-[11px] text-zinc-500 mt-1.5">
                                    The uppercase badge tracked right above your full name.
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>Executive Biography Narrative</label>
                                <textarea
                                    rows={3}
                                    className={inputClass}
                                    value={about.summary || ""}
                                    onChange={(e) => setAbout({ ...about, summary: e.target.value })}
                                    placeholder="High-level engineering overview displayed in the header bio..."
                                />
                                <p className="text-[11px] text-zinc-500 mt-1.5">
                                    The primary narrative paragraph under your name and role.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Media & Resume Assets */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-cyan-400" />
                                <span>Assets &amp; Downloads</span>
                            </h2>
                            <span className="text-[11px] font-mono text-zinc-500">
                                Media and documents linked across the page
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>
                                    <span>Portrait Photo URL</span>
                                    <span className="text-[10px] text-zinc-500">Aspect 4:5 Recommended</span>
                                </label>
                                <input
                                    className={inputClass + " font-mono text-xs"}
                                    value={about.avatarUrl || ""}
                                    onChange={(e) => setAbout({ ...about, avatarUrl: e.target.value })}
                                    placeholder="/Moniruzzaman_Mahdi.png"
                                />
                                <p className="text-[11px] text-zinc-500 mt-1.5">
                                    Editorial portrait shown in the right column of the dossier header.
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <span>Official Resume Download URL</span>
                                    {about.resumeUrl && (
                                        <a
                                            href={about.resumeUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[10px] text-cyan-400 hover:text-white inline-flex items-center gap-0.5"
                                        >
                                            <span>Test File</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </label>
                                <input
                                    className={inputClass + " font-mono text-xs"}
                                    value={about.resumeUrl || ""}
                                    onChange={(e) => setAbout({ ...about, resumeUrl: e.target.value })}
                                    placeholder="/Moniruzzaman_Mahdi_Full_Stack_Developer.pdf"
                                />
                                <p className="text-[11px] text-zinc-500 mt-1.5">
                                    Direct link triggered by the &ldquo;Download Resume&rdquo; button in the header and footer.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA Banner */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span>Collaboration Callout Banner</span>
                            </h2>
                            <span className="text-[11px] font-mono text-zinc-500">
                                Section 06 at the bottom of /about
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Banner Headline</label>
                                <input
                                    className={inputClass}
                                    value={about.ctaHeading || ""}
                                    onChange={(e) => setAbout({ ...about, ctaHeading: e.target.value })}
                                    placeholder="Have an architecture or system to build?"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Banner Subtitle / Description</label>
                                <textarea
                                    rows={2}
                                    className={inputClass}
                                    value={about.ctaDescription || ""}
                                    onChange={(e) => setAbout({ ...about, ctaDescription: e.target.value })}
                                    placeholder="Available for high-impact full-stack roles, system architecture consulting, and rapid MVP engineering."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-SECTION 2: ENGINEERING SPECIALIZATIONS */}
            {/* ========================================================================= */}
            {activeSection === "specializations" && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-cyan-400" />
                                <span>Engineering Specializations ({about.specializations.length})</span>
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Detailed architectural competencies, tech tags, and deliverables rendered under section 04 of the about page.
                            </p>
                        </div>
                        <button
                            onClick={addSpecialization}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Specialization
                        </button>
                    </div>

                    <div className="space-y-6">
                        {about.specializations.map((spec, i) => (
                            <div
                                key={spec.id || i}
                                className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5 hover:border-zinc-700 transition-colors"
                            >
                                <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-widest">
                                            SPEC // 0{i + 1}
                                        </span>
                                        <h3 className="font-bold text-white text-base">
                                            {spec.title || "Untitled Specialization"}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Remove specialization: ${spec.title}?`)) {
                                                setAbout({
                                                    ...about,
                                                    specializations: about.specializations.filter((_, idx) => idx !== i),
                                                });
                                            }
                                        }}
                                        className="text-zinc-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                                        title="Delete Specialization"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Domain Title</label>
                                        <input
                                            className={inputClass + " font-bold"}
                                            value={spec.title}
                                            onChange={(e) => {
                                                const next = [...about.specializations];
                                                next[i].title = e.target.value;
                                                setAbout({ ...about, specializations: next });
                                            }}
                                            placeholder="Scalable Multi-Tenant SaaS Architecture"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            <span>Core Tech &amp; Tools (comma separated)</span>
                                            <span className="text-[10px] text-zinc-500">
                                                {(spec.skills || []).length} tags
                                            </span>
                                        </label>
                                        <input
                                            className={inputClass + " font-mono text-xs"}
                                            value={(spec.skills || []).join(", ")}
                                            onChange={(e) => {
                                                const next = [...about.specializations];
                                                next[i].skills = e.target.value
                                                    .split(",")
                                                    .map((s) => s.trim())
                                                    .filter(Boolean);
                                                setAbout({ ...about, specializations: next });
                                            }}
                                            placeholder="NestJS, Next.js, PostgreSQL, Redis"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Architectural Description</label>
                                    <textarea
                                        rows={3}
                                        className={inputClass}
                                        value={spec.description}
                                        onChange={(e) => {
                                            const next = [...about.specializations];
                                            next[i].description = e.target.value;
                                            setAbout({ ...about, specializations: next });
                                        }}
                                        placeholder="Detailed technical explanation of what you build and the architectural approaches used..."
                                    />
                                </div>

                                {/* Architecture Points / Benchmarks */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className={labelClass}>
                                            <span>Key Architecture Deliverables &amp; Points</span>
                                            <span className="text-[10px] text-zinc-500">
                                                {(spec.points || []).length} items
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = [...about.specializations];
                                                next[i].points = [
                                                    ...(next[i].points || []),
                                                    "New deliverable or architectural highlight",
                                                ];
                                                setAbout({ ...about, specializations: next });
                                            }}
                                            className="text-[10px] font-bold text-cyan-400 hover:text-white uppercase tracking-wider flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Point
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {(spec.points || []).map((pt, ptIdx) => (
                                            <div key={ptIdx} className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0 ml-1" />
                                                <input
                                                    className={inputClass + " text-xs py-1.5"}
                                                    value={pt}
                                                    onChange={(e) => {
                                                        const next = [...about.specializations];
                                                        next[i].points![ptIdx] = e.target.value;
                                                        setAbout({ ...about, specializations: next });
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = [...about.specializations];
                                                        next[i].points = next[i].points!.filter((_, idx) => idx !== ptIdx);
                                                        setAbout({ ...about, specializations: next });
                                                    }}
                                                    className="p-1.5 text-zinc-500 hover:text-rose-400"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-SECTION 3: WORK EXPERIENCE */}
            {/* ========================================================================= */}
            {activeSection === "experience" && (
                <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold uppercase tracking-wider text-white">
                                Work Experience Timeline
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Chronological history rendered under section 01 of the about page.
                            </p>
                        </div>
                        <button
                            onClick={addExperience}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Experience
                        </button>
                    </div>

                    <div className="space-y-5">
                        {about.experience.map((exp, i) => (
                            <div
                                key={i}
                                className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 transition-all hover:border-zinc-700 space-y-4"
                            >
                                <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-zinc-500 font-bold">
                                            #{i + 1}
                                        </span>
                                        <h3 className="font-bold text-white text-sm">
                                            {exp.company || "Untitled Company"}
                                        </h3>
                                        {exp.current && (
                                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                                                Current Role
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Remove ${exp.company}?`)) {
                                                setAbout({
                                                    ...about,
                                                    experience: about.experience.filter((_, idx) => idx !== i),
                                                });
                                            }
                                        }}
                                        className="text-zinc-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                                        title="Delete Experience"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Company Name</label>
                                        <input
                                            className={inputClass}
                                            value={exp.company}
                                            onChange={(e) => {
                                                const next = [...about.experience];
                                                next[i].company = e.target.value;
                                                setAbout({ ...about, experience: next });
                                            }}
                                            placeholder="Kodevio Limited"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Job Title / Role</label>
                                        <input
                                            className={inputClass}
                                            value={exp.role}
                                            onChange={(e) => {
                                                const next = [...about.experience];
                                                next[i].role = e.target.value;
                                                setAbout({ ...about, experience: next });
                                            }}
                                            placeholder="Full Stack Developer"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Period / Duration</label>
                                        <input
                                            className={inputClass}
                                            value={exp.period}
                                            onChange={(e) => {
                                                const next = [...about.experience];
                                                next[i].period = e.target.value;
                                                setAbout({ ...about, experience: next });
                                            }}
                                            placeholder="Aug 2026 – Present"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Location</label>
                                        <input
                                            className={inputClass}
                                            value={exp.location || ""}
                                            onChange={(e) => {
                                                const next = [...about.experience];
                                                next[i].location = e.target.value;
                                                setAbout({ ...about, experience: next });
                                            }}
                                            placeholder="Dhaka, Bangladesh / Remote"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Company Website URL</label>
                                        <input
                                            className={inputClass}
                                            value={exp.companyUrl || ""}
                                            onChange={(e) => {
                                                const next = [...about.experience];
                                                next[i].companyUrl = e.target.value;
                                                setAbout({ ...about, experience: next });
                                            }}
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(exp.current)}
                                                onChange={(e) => {
                                                    const next = [...about.experience];
                                                    next[i].current = e.target.checked;
                                                    setAbout({ ...about, experience: next });
                                                }}
                                                className="rounded border-zinc-700 bg-zinc-800 text-white focus:ring-0"
                                            />
                                            <span>Mark as Currently Active</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Overview Description</label>
                                    <textarea
                                        rows={2}
                                        className={inputClass}
                                        value={exp.description || ""}
                                        onChange={(e) => {
                                            const next = [...about.experience];
                                            next[i].description = e.target.value;
                                            setAbout({ ...about, experience: next });
                                        }}
                                        placeholder="Summary of responsibilities and scope..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className={labelClass}>Key Achievements &amp; Highlights</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = [...about.experience];
                                                next[i].achievements = [...(next[i].achievements || []), "New achievement point"];
                                                setAbout({ ...about, experience: next });
                                            }}
                                            className="text-[10px] font-bold text-zinc-300 hover:text-white uppercase tracking-wider flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Point
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {(exp.achievements || []).map((ach, achIdx) => (
                                            <div key={achIdx} className="flex items-center gap-2">
                                                <input
                                                    className={inputClass + " text-xs py-1.5"}
                                                    value={ach}
                                                    onChange={(e) => {
                                                        const next = [...about.experience];
                                                        next[i].achievements[achIdx] = e.target.value;
                                                        setAbout({ ...about, experience: next });
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = [...about.experience];
                                                        next[i].achievements = next[i].achievements.filter((_, idx) => idx !== achIdx);
                                                        setAbout({ ...about, experience: next });
                                                    }}
                                                    className="p-1.5 text-zinc-500 hover:text-rose-400"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-SECTION 4: FORMAL EDUCATION */}
            {/* ========================================================================= */}
            {activeSection === "education" && (
                <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold uppercase tracking-wider text-white">
                                Formal Education History
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Degrees and academic credentials rendered under section 05.
                            </p>
                        </div>
                        <button
                            onClick={addEducation}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Degree
                        </button>
                    </div>

                    <div className="space-y-4">
                        {about.education.map((edu, i) => (
                            <div
                                key={i}
                                className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 transition-all hover:border-zinc-700 space-y-4"
                            >
                                <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-zinc-500 font-bold">
                                            #{i + 1}
                                        </span>
                                        <h3 className="font-bold text-white text-sm">
                                            {edu.institution || "Institution"}
                                        </h3>
                                        {edu.current && (
                                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                                                On-Going
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Remove ${edu.institution}?`)) {
                                                setAbout({
                                                    ...about,
                                                    education: about.education.filter((_, idx) => idx !== i),
                                                });
                                            }
                                        }}
                                        className="text-zinc-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Institution</label>
                                        <input
                                            className={inputClass}
                                            value={edu.institution}
                                            onChange={(e) => {
                                                const next = [...about.education];
                                                next[i].institution = e.target.value;
                                                setAbout({ ...about, education: next });
                                            }}
                                            placeholder="National University"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Degree / Certificate</label>
                                        <input
                                            className={inputClass}
                                            value={edu.degree}
                                            onChange={(e) => {
                                                const next = [...about.education];
                                                next[i].degree = e.target.value;
                                                setAbout({ ...about, education: next });
                                            }}
                                            placeholder="Bachelor of Science"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Period</label>
                                        <input
                                            className={inputClass}
                                            value={edu.period}
                                            onChange={(e) => {
                                                const next = [...about.education];
                                                next[i].period = e.target.value;
                                                setAbout({ ...about, education: next });
                                            }}
                                            placeholder="2025 – Present"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(edu.current)}
                                            onChange={(e) => {
                                                const next = [...about.education];
                                                next[i].current = e.target.checked;
                                                setAbout({ ...about, education: next });
                                            }}
                                            className="rounded border-zinc-700 bg-zinc-800 text-white"
                                        />
                                        <span>Currently On-Going</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-SECTION 5: VERIFIED COURSES */}
            {/* ========================================================================= */}
            {activeSection === "courses" && (
                <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold uppercase tracking-wider text-white">
                                Verified Courses &amp; Certifications
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Credentials with verification links rendered under section 05.
                            </p>
                        </div>
                        <button
                            onClick={addCourse}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Course
                        </button>
                    </div>

                    <div className="space-y-4">
                        {about.courses.map((crs, i) => (
                            <div
                                key={i}
                                className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 transition-all hover:border-zinc-700 space-y-4"
                            >
                                <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-zinc-500 font-bold">
                                            #{i + 1}
                                        </span>
                                        <h3 className="font-bold text-white text-sm">
                                            {crs.title || "Untitled Course"}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Remove ${crs.title}?`)) {
                                                setAbout({
                                                    ...about,
                                                    courses: about.courses.filter((_, idx) => idx !== i),
                                                });
                                            }
                                        }}
                                        className="text-zinc-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Course / Cohort Title</label>
                                        <input
                                            className={inputClass}
                                            value={crs.title}
                                            onChange={(e) => {
                                                const next = [...about.courses];
                                                next[i].title = e.target.value;
                                                setAbout({ ...about, courses: next });
                                            }}
                                            placeholder="System Design Cohort"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Institution / Platform</label>
                                        <input
                                            className={inputClass}
                                            value={crs.institution}
                                            onChange={(e) => {
                                                const next = [...about.courses];
                                                next[i].institution = e.target.value;
                                                setAbout({ ...about, courses: next });
                                            }}
                                            placeholder="Chai aur Code"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Period / Year</label>
                                        <input
                                            className={inputClass}
                                            value={crs.period}
                                            onChange={(e) => {
                                                const next = [...about.courses];
                                                next[i].period = e.target.value;
                                                setAbout({ ...about, courses: next });
                                            }}
                                            placeholder="2026"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        <span>Certificate Verification URL</span>
                                        {crs.certificateUrl && (
                                            <a
                                                href={crs.certificateUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[10px] text-cyan-400 hover:text-white"
                                            >
                                                Verify ↗
                                            </a>
                                        )}
                                    </label>
                                    <input
                                        className={inputClass + " font-mono text-xs"}
                                        value={crs.certificateUrl || ""}
                                        onChange={(e) => {
                                            const next = [...about.courses];
                                            next[i].certificateUrl = e.target.value;
                                            setAbout({ ...about, courses: next });
                                        }}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
