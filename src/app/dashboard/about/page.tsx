"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { DashboardFormSkeleton } from "@/components/dashboard/DashboardSkeletons";
import {
    Briefcase,
    GraduationCap,
    Award,
    Target,
    Plus,
    Trash2,
    Save,
    RotateCcw,
    Check,
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    X,
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

export interface AboutData {
    label: string;
    education: Education[];
    experience: Experience[];
    courses: Course[];
    focus: string[];
}

type SubSection = "experience" | "education" | "courses" | "focus";

export default function AboutDashboardPage() {
    const [about, setAbout] = useState<AboutData>({
        label: "Background & Data",
        education: [],
        experience: [],
        courses: [],
        focus: [],
    });
    const [savedAbout, setSavedAbout] = useState<AboutData>({
        label: "Background & Data",
        education: [],
        experience: [],
        courses: [],
        focus: [],
    });

    const [activeSection, setActiveSection] = useState<SubSection>("experience");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load data (scoped to about section)
    const loadData = useCallback(async () => {
        try {
            const res = await fetch("/api/portfolio?scope=about");
            const data = await res.json();
            if (data?.about) {
                const normalized: AboutData = {
                    label: data.about.label || "Background & Data",
                    education: Array.isArray(data.about.education) ? data.about.education : [],
                    experience: Array.isArray(data.about.experience) ? data.about.experience : [],
                    courses: Array.isArray(data.about.courses) ? data.about.courses : [],
                    focus: Array.isArray(data.about.focus) ? data.about.focus : [],
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
            // Save ONLY the about slice without overwriting projects or other relations
            const res = await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ about }),
            });

            if (res.ok) {
                setSavedAbout(JSON.parse(JSON.stringify(about)));
                toast.success("About & career milestones saved to database!");
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
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSave]);

    // Manipulators
    const addExperience = () => {
        setAbout((prev) => ({
            ...prev,
            experience: [
                {
                    company: "Company Name",
                    role: "Senior Full Stack Engineer",
                    period: "2024 — Present",
                    location: "Remote",
                    current: true,
                    companyUrl: "https://",
                    description: "Built scalable web applications and resilient backend services.",
                    achievements: [
                        "Architected low-latency microservices with automated testing",
                        "Led cross-functional delivery team driving sprint goals",
                    ],
                },
                ...prev.experience,
            ],
        }));
        toast.info("Added new work role");
    };

    const addEducation = () => {
        setAbout((prev) => ({
            ...prev,
            education: [
                {
                    degree: "Bachelor of Science",
                    institution: "University / Institute",
                    period: "2024 — Present",
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
                    title: "Specialized Course / Certification",
                    institution: "Platform / Institute",
                    period: "2024",
                    certificateUrl: "https://",
                    completed: true,
                },
                ...prev.courses,
            ],
        }));
        toast.info("Added course entry");
    };

    const addFocus = () => {
        setAbout((prev) => ({
            ...prev,
            focus: [...prev.focus, "Scalable Full-Stack Engineering"],
        }));
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
                        About & Career Milestones
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
                        Organize your work history timeline, formal degrees, certified courses, and engineering focus pillars.
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
                    onClick={() => setActiveSection("experience")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                        activeSection === "courses"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Award className="w-4 h-4" />
                    <span>Verified Courses ({about.courses.length})</span>
                </button>

                <button
                    onClick={() => setActiveSection("focus")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                        activeSection === "focus"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Target className="w-4 h-4" />
                    <span>Focus Pillars ({about.focus.length})</span>
                </button>
            </div>

            {/* ========================================================================= */}
            {/* SUB-SECTION 1: WORK EXPERIENCE */}
            {/* ========================================================================= */}
            {activeSection === "experience" && (
                <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold uppercase tracking-wider text-white">
                                Work Experience Timeline
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Real work history displayed on your About timeline.
                            </p>
                        </div>
                        <button
                            onClick={addExperience}
                            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Role
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
                        {about.experience.map((exp, i) => (
                            <div
                                key={i}
                                className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-zinc-700 transition-all shadow-sm"
                            >
                                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                                            Position #{i + 1}
                                        </span>
                                        {exp.current && (
                                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                                                Active Role
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setAbout((prev) => ({
                                                ...prev,
                                                experience: prev.experience.filter((_, idx) => idx !== i),
                                            }));
                                        }}
                                        className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Remove
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                                            placeholder="Company / Client"
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
                                            placeholder="Full Stack Engineer"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Employment Duration</label>
                                        <input
                                            className={inputClass}
                                            value={exp.period}
                                            onChange={(e) => {
                                                const next = [...about.experience];
                                                next[i].period = e.target.value;
                                                setAbout({ ...about, experience: next });
                                            }}
                                            placeholder="2024 — Present"
                                        />
                                    </div>

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
                                            placeholder="Remote / City"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>
                                            <span>Company Website URL</span>
                                            {exp.companyUrl && (
                                                <a
                                                    href={exp.companyUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[9px] text-zinc-400 hover:text-white"
                                                >
                                                    Visit ↗
                                                </a>
                                            )}
                                        </label>
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
                                </div>

                                <div>
                                    <label className={labelClass}>Role Summary</label>
                                    <textarea
                                        className={inputClass + " resize-y min-h-[60px] leading-relaxed"}
                                        rows={2}
                                        value={exp.description || ""}
                                        onChange={(e) => {
                                            const next = [...about.experience];
                                            next[i].description = e.target.value;
                                            setAbout({ ...about, experience: next });
                                        }}
                                        placeholder="Overview of core duties and impact..."
                                    />
                                </div>

                                {/* Achievements Bullet Points */}
                                <div className="pt-2 border-t border-zinc-800/80">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                                            Key Engineering Deliverables ({exp.achievements?.length || 0})
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = [...about.experience];
                                                next[i].achievements = [
                                                    ...(next[i].achievements || []),
                                                    "New technical accomplishment",
                                                ];
                                                setAbout({ ...about, experience: next });
                                            }}
                                            className="text-[10px] font-bold uppercase text-white bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Bullet
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {(exp.achievements || []).map((ach, achIdx) => (
                                            <div key={achIdx} className="flex items-center gap-2">
                                                <span className="text-zinc-600 font-mono text-xs">•</span>
                                                <input
                                                    className={inputClass + " py-1.5 text-xs"}
                                                    value={ach}
                                                    onChange={(e) => {
                                                        const next = [...about.experience];
                                                        next[i].achievements[achIdx] = e.target.value;
                                                        setAbout({ ...about, experience: next });
                                                    }}
                                                    placeholder="Achievement statement..."
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = [...about.experience];
                                                        next[i].achievements = next[i].achievements.filter(
                                                            (_, idx) => idx !== achIdx
                                                        );
                                                        setAbout({ ...about, experience: next });
                                                    }}
                                                    className="p-1 text-zinc-500 hover:text-rose-400 rounded"
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
            {/* SUB-SECTION 2: FORMAL EDUCATION */}
            {/* ========================================================================= */}
            {activeSection === "education" && (
                <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold uppercase tracking-wider text-white">
                                Formal Degrees & Academics
                            </h2>
                            <p className="text-xs text-zinc-400">
                                University and institution background.
                            </p>
                        </div>
                        <button
                            onClick={addEducation}
                            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Degree
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                        {about.education.map((edu, i) => (
                            <div
                                key={i}
                                className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-700 transition-all shadow-sm"
                            >
                                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                                            Degree #{i + 1}
                                        </span>
                                        {edu.current && (
                                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                                                Ongoing
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setAbout((prev) => ({
                                                ...prev,
                                                education: prev.education.filter((_, idx) => idx !== i),
                                            }));
                                        }}
                                        className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" /> Remove
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className={labelClass}>Degree / Qualification</label>
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
                                        <label className={labelClass}>Institution / University</label>
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

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className={labelClass}>Academic Period</label>
                                            <input
                                                className={inputClass}
                                                value={edu.period}
                                                onChange={(e) => {
                                                    const next = [...about.education];
                                                    next[i].period = e.target.value;
                                                    setAbout({ ...about, education: next });
                                                }}
                                                placeholder="2024 — Present"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-end pb-1">
                                            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 py-2">
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
                                                <span>Ongoing Study</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-SECTION 3: VERIFIED COURSES */}
            {/* ========================================================================= */}
            {activeSection === "courses" && (
                <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold uppercase tracking-wider text-white">
                                Verified Courses & Certifications
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Professional certificates and specialized computer science education.
                            </p>
                        </div>
                        <button
                            onClick={addCourse}
                            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Certification
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                        {about.courses.map((crs, i) => (
                            <div
                                key={i}
                                className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-700 transition-all shadow-sm"
                            >
                                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                                            Cert #{i + 1}
                                        </span>
                                        {crs.completed && (
                                            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setAbout((prev) => ({
                                                ...prev,
                                                courses: prev.courses.filter((_, idx) => idx !== i),
                                            }));
                                        }}
                                        className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" /> Remove
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className={labelClass}>Course / Certificate Title</label>
                                        <input
                                            className={inputClass}
                                            value={crs.title}
                                            onChange={(e) => {
                                                const next = [...about.courses];
                                                next[i].title = e.target.value;
                                                setAbout({ ...about, courses: next });
                                            }}
                                            placeholder="CS50: Introduction to Computer Science"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Issuer / Platform</label>
                                        <input
                                            className={inputClass}
                                            value={crs.institution}
                                            onChange={(e) => {
                                                const next = [...about.courses];
                                                next[i].institution = e.target.value;
                                                setAbout({ ...about, courses: next });
                                            }}
                                            placeholder="Harvard University / edX"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className={labelClass}>Completion Year</label>
                                            <input
                                                className={inputClass}
                                                value={crs.period}
                                                onChange={(e) => {
                                                    const next = [...about.courses];
                                                    next[i].period = e.target.value;
                                                    setAbout({ ...about, courses: next });
                                                }}
                                                placeholder="2023"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-end pb-1">
                                            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(crs.completed)}
                                                    onChange={(e) => {
                                                        const next = [...about.courses];
                                                        next[i].completed = e.target.checked;
                                                        setAbout({ ...about, courses: next });
                                                    }}
                                                    className="rounded border-zinc-700 bg-zinc-800 text-white"
                                                />
                                                <span>Completed</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            <span>Certificate URL</span>
                                            {crs.certificateUrl && (
                                                <a
                                                    href={crs.certificateUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[9px] text-zinc-400 hover:text-white"
                                                >
                                                    View ↗
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
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-SECTION 4: FOCUS PILLARS */}
            {/* ========================================================================= */}
            {activeSection === "focus" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 lg:col-span-1 flex flex-col justify-between">
                        <div>
                            <label className={labelClass}>Section Overline Label</label>
                            <input
                                className={inputClass}
                                value={about.label}
                                onChange={(e) => setAbout({ ...about, label: e.target.value })}
                                placeholder="Background & Data"
                            />
                            <p className="text-xs text-zinc-500 mt-2">
                                The label pill rendered above the About section on the public site.
                            </p>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-zinc-300" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                                    Core Focus Areas ({about.focus.length})
                                </h3>
                            </div>
                            <button
                                onClick={addFocus}
                                className="flex items-center gap-1 text-[10px] font-bold uppercase text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded"
                            >
                                <Plus className="w-3 h-3" /> Add Pillar
                            </button>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {about.focus.map((f, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        className={inputClass + " py-2 text-xs"}
                                        value={f}
                                        onChange={(e) => {
                                            const next = [...about.focus];
                                            next[i] = e.target.value;
                                            setAbout({ ...about, focus: next });
                                        }}
                                        placeholder="Focus domain..."
                                    />
                                    <button
                                        onClick={() => {
                                            setAbout({
                                                ...about,
                                                focus: about.focus.filter((_, idx) => idx !== i),
                                            });
                                        }}
                                        className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
