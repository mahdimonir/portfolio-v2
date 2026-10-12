"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DashboardFormSkeleton } from "@/components/dashboard/DashboardSkeletons";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Clock,
    Save,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    Github,
    Linkedin,
    Twitter,
    Layers,
    FileText,
    ExternalLink,
    Globe,
    Briefcase,
    GraduationCap,
    Plus,
    Trash2,
    X,
    Compass,
    Image as ImageIcon,
    UploadCloud,
    Loader2,
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

export interface ProfileAboutCleanData {
    // Identity & Roles
    name: string;
    firstName: string;
    title: string;
    role: string;

    // Biography
    summary: string;

    // Assets & Documents
    avatarUrl: string;
    resumeUrl: string;
    websiteUrl: string;

    // Coordinates & Contact
    location: string;
    email: string;
    phone: string;
    timezone: string;
    availability: string;
    responseTime: string;

    // Socials
    socials: {
        github: string;
        linkedin: string;
        twitter: string;
        portfolio3d?: string;
    };

    // Services / Focus Areas (Specializations)
    specializations: SpecializationItem[];

    // Career History
    experience: Experience[];

    // Formal Education & Courses
    education: Education[];
    courses: Course[];
}

const DEFAULT_DATA: ProfileAboutCleanData = {
    name: "Moniruzzaman Mahdi",
    firstName: "Mahdi",
    title: "Full Stack Software Engineer",
    role: "Full Stack Developer & Software Architect",
    summary:
        "Building scalable web applications, automating the complex and transforming static systems into intelligent architectures. Focused on modular NestJS APIs, Next.js full-stack workflows, Go microservices, and PostgreSQL data systems with clean architecture and strict type safety.",
    avatarUrl: "/Moniruzzaman_Mahdi.png",
    resumeUrl: "/Moniruzzaman_Mahdi_Full_Stack_Developer.pdf",
    websiteUrl: "https://mahdimonir.dev",
    location: "Chattogram, Bangladesh",
    email: "mahdimonir2004@gmail.com",
    phone: "+880 1836-848889",
    timezone: "GMT+6",
    availability: "AVAILABLE FOR WORK",
    responseTime: "⚡ Usually responds within 24 hours",
    socials: {
        github: "https://github.com/mahdimonir",
        linkedin: "https://www.linkedin.com/in/moniruzzaman-mahdi/",
        twitter: "https://x.com/Mahdimonir2004",
        portfolio3d: "https://3d.mahdimonir.dev",
    },
    specializations: [],
    experience: [],
    education: [],
    courses: [],
};

type TabKey = "profile" | "services" | "experience" | "credentials";

function ProfileAboutInner() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab") as TabKey | null;

    const [form, setForm] = useState<ProfileAboutCleanData>(DEFAULT_DATA);
    const [savedForm, setSavedForm] = useState<ProfileAboutCleanData>(DEFAULT_DATA);
    const [activeTab, setActiveTab] = useState<TabKey>(
        tabParam && ["profile", "services", "experience", "credentials"].includes(tabParam)
            ? tabParam
            : "profile"
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Cloudinary upload & delete states & refs
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [deletingAvatar, setDeletingAvatar] = useState(false);
    const [deletingResume, setDeletingResume] = useState(false);
    const [avatarDragOver, setAvatarDragOver] = useState(false);
    const [resumeDragOver, setResumeDragOver] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const resumeInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (file: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file (PNG, JPG, WEBP, etc.)");
            return;
        }
        setUploadingAvatar(true);
        const toastId = toast.loading("Uploading portrait to Cloudinary...");
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "portfolio-uploads/profile");
            // If replacing an existing Cloudinary asset, tell server to delete the old one
            if (form.avatarUrl && form.avatarUrl.includes("cloudinary.com")) {
                formData.append("oldUrl", form.avatarUrl);
            }

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    setForm((prev) => ({ ...prev, avatarUrl: data.url }));
                    toast.success(
                        data.deletedOld
                            ? "Portrait uploaded & previous photo deleted from Cloudinary!"
                            : "Portrait photo uploaded to Cloudinary!",
                        { id: toastId }
                    );
                } else {
                    toast.error("Cloudinary did not return a valid URL", { id: toastId });
                }
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to upload photo to Cloudinary", { id: toastId });
            }
        } catch {
            toast.error("Network error while uploading photo to Cloudinary", { id: toastId });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!form.avatarUrl) return;
        if (!confirm("Remove and permanently delete this portrait photo from Cloudinary?")) return;

        if (form.avatarUrl.includes("cloudinary.com")) {
            setDeletingAvatar(true);
            const toastId = toast.loading("Deleting photo from Cloudinary...");
            try {
                const res = await fetch(`/api/upload?url=${encodeURIComponent(form.avatarUrl)}`, {
                    method: "DELETE",
                    credentials: "include",
                });
                if (res.ok) {
                    setForm((prev) => ({ ...prev, avatarUrl: "" }));
                    toast.success("Portrait photo deleted from Cloudinary", { id: toastId });
                } else {
                    toast.error("Failed to delete photo from Cloudinary", { id: toastId });
                }
            } catch {
                toast.error("Network error while deleting photo", { id: toastId });
            } finally {
                setDeletingAvatar(false);
            }
        } else {
            setForm((prev) => ({ ...prev, avatarUrl: "" }));
            toast.info("Photo removed");
        }
    };

    const handleResumeUpload = async (file: File) => {
        if (!file) return;
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            toast.error("Please select a PDF document (.pdf)");
            return;
        }
        setUploadingResume(true);
        const toastId = toast.loading("Uploading resume PDF to Cloudinary...");
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "portfolio-uploads/resumes");
            // If replacing an existing Cloudinary asset, tell server to delete the old one
            if (form.resumeUrl && form.resumeUrl.includes("cloudinary.com")) {
                formData.append("oldUrl", form.resumeUrl);
            }

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    setForm((prev) => ({ ...prev, resumeUrl: data.url }));
                    toast.success(
                        data.deletedOld
                            ? "Resume PDF uploaded & previous document deleted from Cloudinary!"
                            : "Resume PDF uploaded to Cloudinary!",
                        { id: toastId }
                    );
                } else {
                    toast.error("Cloudinary did not return a file URL", { id: toastId });
                }
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to upload resume to Cloudinary", { id: toastId });
            }
        } catch {
            toast.error("Network error while uploading resume to Cloudinary", { id: toastId });
        } finally {
            setUploadingResume(false);
        }
    };

    const handleDeleteResume = async () => {
        if (!form.resumeUrl) return;
        if (!confirm("Remove and permanently delete this resume PDF from Cloudinary?")) return;

        if (form.resumeUrl.includes("cloudinary.com")) {
            setDeletingResume(true);
            const toastId = toast.loading("Deleting resume PDF from Cloudinary...");
            try {
                const res = await fetch(`/api/upload?url=${encodeURIComponent(form.resumeUrl)}`, {
                    method: "DELETE",
                    credentials: "include",
                });
                if (res.ok) {
                    setForm((prev) => ({ ...prev, resumeUrl: "" }));
                    toast.success("Resume PDF deleted from Cloudinary", { id: toastId });
                } else {
                    toast.error("Failed to delete resume from Cloudinary", { id: toastId });
                }
            } catch {
                toast.error("Network error while deleting resume", { id: toastId });
            } finally {
                setDeletingResume(false);
            }
        } else {
            setForm((prev) => ({ ...prev, resumeUrl: "" }));
            toast.info("Resume document removed");
        }
    };

    const loadData = useCallback(async () => {
        try {
            const res = await fetch("/api/portfolio");
            const data = await res.json();
            if (data) {
                const rawSpecs = Array.isArray(data.about?.specializations)
                    ? data.about.specializations
                    : [];

                const normalized: ProfileAboutCleanData = {
                    name: data.name || DEFAULT_DATA.name,
                    firstName: data.firstName || DEFAULT_DATA.firstName,
                    title: data.title || DEFAULT_DATA.title,
                    role: data.role || DEFAULT_DATA.role,
                    summary: data.about?.summary || DEFAULT_DATA.summary,
                    avatarUrl: data.about?.avatarUrl || DEFAULT_DATA.avatarUrl,
                    resumeUrl:
                        data.resumeUrl ||
                        data.about?.resumeUrl ||
                        DEFAULT_DATA.resumeUrl,
                    websiteUrl: data.about?.websiteUrl || DEFAULT_DATA.websiteUrl,
                    location: data.location || DEFAULT_DATA.location,
                    email: data.email || DEFAULT_DATA.email,
                    phone: data.phone || DEFAULT_DATA.phone,
                    timezone: data.timezone || DEFAULT_DATA.timezone,
                    availability: data.availability || DEFAULT_DATA.availability,
                    responseTime: data.responseTime || DEFAULT_DATA.responseTime,
                    socials: {
                        github: data.socials?.github || DEFAULT_DATA.socials.github,
                        linkedin: data.socials?.linkedin || DEFAULT_DATA.socials.linkedin,
                        twitter: data.socials?.twitter || DEFAULT_DATA.socials.twitter,
                        portfolio3d: data.socials?.portfolio3d || DEFAULT_DATA.socials.portfolio3d,
                    },
                    specializations: rawSpecs.map((s: any, idx: number) => ({
                        id: s.id || `spec-${idx + 1}`,
                        title: s.title || "Specialization",
                        description: s.description || "",
                        skills: Array.isArray(s.skills) ? s.skills : [],
                        points: Array.isArray(s.points) ? s.points : [],
                    })),
                    experience: Array.isArray(data.about?.experience) ? data.about.experience : [],
                    education: Array.isArray(data.about?.education) ? data.about.education : [],
                    courses: Array.isArray(data.about?.courses) ? data.about.courses : [],
                };

                setForm(normalized);
                setSavedForm(JSON.parse(JSON.stringify(normalized)));
            }
        } catch (err) {
            console.error("Failed to load profile & about data:", err);
            toast.error("Failed to load profile information");
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
                name: form.name,
                firstName: form.firstName,
                title: form.title,
                role: form.role,
                location: form.location,
                email: form.email,
                phone: form.phone,
                timezone: form.timezone,
                availability: form.availability,
                responseTime: form.responseTime,
                socials: form.socials,
                resumeUrl: form.resumeUrl,
                about: {
                    summary: form.summary,
                    avatarUrl: form.avatarUrl,
                    resumeUrl: form.resumeUrl,
                    websiteUrl: form.websiteUrl,
                    focus: form.specializations.map((s) => s.title),
                    specializations: form.specializations,
                    experience: form.experience,
                    education: form.education,
                    courses: form.courses,
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
                toast.success("Profile, bio, specializations, and career data saved!");
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
        if (confirm("Discard unsaved changes to Profile & About?")) {
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

    // Helper modifiers
    const addSpecialization = () => {
        setForm((prev) => ({
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
        toast.info("Added specialization entry");
    };

    const addExperience = () => {
        setForm((prev) => ({
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
        toast.info("Added experience entry");
    };

    const addEducation = () => {
        setForm((prev) => ({
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
        toast.info("Added degree entry");
    };

    const addCourse = () => {
        setForm((prev) => ({
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

    const inputClass =
        "w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all";
    const labelClass =
        "text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between";

    if (loading) {
        return <DashboardFormSkeleton title="Profile & About" />;
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Header & Save Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        Profile &amp; About Data
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
                        Clean management for your executive identity, editorial portrait, resume, services/specializations, and career milestones.
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

            {/* Clean Segmented Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeTab === "profile"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <User className="w-4 h-4" />
                    <span>Identity, Bio &amp; Assets</span>
                </button>

                <button
                    onClick={() => setActiveTab("services")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeTab === "services"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Services &amp; Specializations ({form.specializations.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab("experience")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeTab === "experience"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Briefcase className="w-4 h-4" />
                    <span>Work Experience ({form.experience.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab("credentials")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                        activeTab === "credentials"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <GraduationCap className="w-4 h-4" />
                    <span>Education &amp; Certifications ({form.education.length + form.courses.length})</span>
                </button>
            </div>

            {/* TAB 1: IDENTITY, BIO & ASSETS */}
            {activeTab === "profile" && (
                <div className="flex flex-col gap-6">
                    {/* Executive Identity & Roles */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <User className="w-4 h-4 text-cyan-400" />
                                <span>Executive Identity &amp; Roles</span>
                            </h2>
                            <span className="text-[11px] font-mono text-zinc-500">
                                Global branding across navigation, hero, and about
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Full Legal / Professional Name (Visible UI)</label>
                                <input
                                    className={inputClass + " font-bold"}
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Moniruzzaman Mahdi"
                                />
                                <p className="text-[11px] text-zinc-500 mt-1.5">
                                    Prominently rendered in all headers, hero, and about page.
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>Short Monogram / Brand Mark</label>
                                <input
                                    className={inputClass + " font-bold uppercase"}
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    placeholder="MAHDI"
                                />
                                <p className="text-[11px] text-zinc-500 mt-1.5">
                                    Used for corner brand logos (MAHDI®).
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>Professional Role / Subtitle</label>
                                <input
                                    className={inputClass}
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    placeholder="Full Stack Developer & Software Architect"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Short Meta Title</label>
                                <input
                                    className={inputClass}
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Full Stack Software Engineer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Executive Biography Narrative */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800/70 pb-3">
                            <FileText className="w-4 h-4 text-cyan-400" />
                            <span>Executive Biography Narrative</span>
                        </h2>

                        <div>
                            <textarea
                                rows={4}
                                className={inputClass}
                                value={form.summary}
                                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                                placeholder="High-level engineering overview displayed under your name on the About page..."
                            />
                            <p className="text-[11px] text-zinc-500 mt-1.5">
                                Primary executive bio paragraph displayed in the dossier header on /about.
                            </p>
                        </div>
                    </div>

                    {/* Editorial Portrait Photo & Official Resume Assets */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-cyan-400" />
                                <span>Cloudinary Assets: Portrait Photo &amp; Resume PDF</span>
                            </h2>
                            <span className="text-[11px] font-mono text-zinc-500">
                                Directly uploaded and hosted on Cloudinary CDN
                            </span>
                        </div>

                        {/* Hidden file inputs */}
                        <input
                            type="file"
                            ref={avatarInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAvatarUpload(file);
                                e.target.value = "";
                            }}
                        />
                        <input
                            type="file"
                            ref={resumeInputRef}
                            accept=".pdf,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleResumeUpload(file);
                                e.target.value = "";
                            }}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Card 1: Editorial Portrait Upload */}
                            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-cyan-400" />
                                            <span>Editorial Portrait Photo</span>
                                        </span>
                                        {form.avatarUrl.includes("cloudinary.com") ? (
                                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                                                Cloudinary CDN
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                                                Local Asset
                                            </span>
                                        )}
                                    </div>

                                    {/* Preview & Drag Drop Zone */}
                                    <div
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setAvatarDragOver(true);
                                        }}
                                        onDragLeave={() => setAvatarDragOver(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setAvatarDragOver(false);
                                            const file = e.dataTransfer.files?.[0];
                                            if (file) handleAvatarUpload(file);
                                        }}
                                        onClick={() => avatarInputRef.current?.click()}
                                        className={`cursor-pointer relative aspect-[4/5] max-h-56 mx-auto w-full max-w-[200px] rounded-xl overflow-hidden border-2 transition-all flex flex-col items-center justify-center p-2 text-center ${
                                            avatarDragOver
                                                ? "border-cyan-400 bg-cyan-950/30"
                                                : "border-zinc-800 hover:border-zinc-600 bg-black"
                                        }`}
                                    >
                                        {form.avatarUrl ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={form.avatarUrl}
                                                    alt="Portrait Preview"
                                                    className="w-full h-full object-cover object-top rounded-lg"
                                                />
                                                <div className="absolute inset-0 bg-black/40 hover:bg-black/60 transition-colors flex flex-col items-center justify-center opacity-0 hover:opacity-100 p-3">
                                                    <UploadCloud className="w-6 h-6 text-white mb-1" />
                                                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                                                        Change Photo
                                                    </span>
                                                    <span className="text-[9px] text-zinc-300">
                                                        Drop image to upload
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4">
                                                <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
                                                <span className="text-xs font-bold text-zinc-300">
                                                    Upload Portrait
                                                </span>
                                                <span className="text-[10px] text-zinc-500 mt-1">
                                                    Drag &amp; drop or click
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={uploadingAvatar || deletingAvatar}
                                            onClick={() => avatarInputRef.current?.click()}
                                            className="flex-1 py-2 px-3 bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {uploadingAvatar ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Replacing on Cloudinary...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-3.5 h-3.5" />
                                                    <span>{form.avatarUrl ? "Replace Photo" : "Upload Photo"}</span>
                                                </>
                                            )}
                                        </button>

                                        {form.avatarUrl && (
                                            <button
                                                type="button"
                                                disabled={uploadingAvatar || deletingAvatar}
                                                onClick={handleDeleteAvatar}
                                                className="py-2 px-3 border border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                                title="Delete photo from Cloudinary"
                                            >
                                                {deletingAvatar ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                                <span>Delete</span>
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
                                            Portrait Photo URL
                                        </label>
                                        <input
                                            className={inputClass + " font-mono text-xs py-1.5"}
                                            value={form.avatarUrl}
                                            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                                            placeholder="https://res.cloudinary.com/..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Official Resume Upload */}
                            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-cyan-400" />
                                            <span>Official Resume Document</span>
                                        </span>
                                        {form.resumeUrl.includes("cloudinary.com") ? (
                                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                                                Cloudinary Hosted
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                                                Local File
                                            </span>
                                        )}
                                    </div>

                                    {/* Resume Drop Zone / File Card */}
                                    <div
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setResumeDragOver(true);
                                        }}
                                        onDragLeave={() => setResumeDragOver(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setResumeDragOver(false);
                                            const file = e.dataTransfer.files?.[0];
                                            if (file) handleResumeUpload(file);
                                        }}
                                        onClick={() => resumeInputRef.current?.click()}
                                        className={`cursor-pointer relative aspect-[4/5] max-h-56 mx-auto w-full max-w-[200px] rounded-xl border-2 transition-all flex flex-col items-center justify-center p-4 text-center ${
                                            resumeDragOver
                                                ? "border-cyan-400 bg-cyan-950/30"
                                                : "border-zinc-800 hover:border-zinc-600 bg-black"
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3 text-cyan-400">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[160px]">
                                            {form.resumeUrl ? form.resumeUrl.split("/").pop() : "Resume PDF"}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 mt-1">
                                            Click or drop new PDF to upload
                                        </span>

                                        {form.resumeUrl && (
                                            <a
                                                href={form.resumeUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-white px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 rounded border border-cyan-500/30 transition-colors"
                                            >
                                                <span>Test / View PDF</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={uploadingResume || deletingResume}
                                            onClick={() => resumeInputRef.current?.click()}
                                            className="flex-1 py-2 px-3 bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {uploadingResume ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Replacing on Cloudinary...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-3.5 h-3.5" />
                                                    <span>{form.resumeUrl ? "Replace Resume" : "Upload PDF"}</span>
                                                </>
                                            )}
                                        </button>

                                        {form.resumeUrl && (
                                            <button
                                                type="button"
                                                disabled={uploadingResume || deletingResume}
                                                onClick={handleDeleteResume}
                                                className="py-2 px-3 border border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                                title="Delete resume PDF from Cloudinary"
                                            >
                                                {deletingResume ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                                <span>Delete</span>
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
                                            Official Resume PDF URL
                                        </label>
                                        <input
                                            className={inputClass + " font-mono text-xs py-1.5"}
                                            value={form.resumeUrl}
                                            onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                                            placeholder="https://res.cloudinary.com/..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Personal Website */}
                            <div className="md:col-span-2">
                                <label className={labelClass}>Personal Website / System URL</label>
                                <input
                                    className={inputClass}
                                    value={form.websiteUrl}
                                    onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                                    placeholder="https://mahdimonir.dev"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Coordinates & Contact Info */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-cyan-400" />
                                <span>Contact Coordinates &amp; Availability</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email
                                    </span>
                                </label>
                                <input
                                    type="email"
                                    className={inputClass}
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="mahdimonir2004@gmail.com"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-cyan-400" /> Phone
                                    </span>
                                </label>
                                <input
                                    className={inputClass}
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+880 1836-848889"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Location
                                    </span>
                                </label>
                                <input
                                    className={inputClass}
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    placeholder="Chattogram, Bangladesh"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-cyan-400" /> Timezone
                                    </span>
                                </label>
                                <input
                                    className={inputClass}
                                    value={form.timezone}
                                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                                    placeholder="GMT+6 (BST)"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Availability Status</label>
                                <input
                                    className={inputClass}
                                    value={form.availability}
                                    onChange={(e) => setForm({ ...form, availability: e.target.value })}
                                    placeholder="AVAILABLE FOR WORK"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Response Time Promise</label>
                                <input
                                    className={inputClass}
                                    value={form.responseTime}
                                    onChange={(e) => setForm({ ...form, responseTime: e.target.value })}
                                    placeholder="⚡ Usually responds within 24 hours"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Handles */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <Globe className="w-4 h-4 text-cyan-400" />
                                <span>Social Handles &amp; 3D Portfolio</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5">
                                        <Github className="w-3.5 h-3.5 text-cyan-400" /> GitHub URL
                                    </span>
                                </label>
                                <input
                                    className={inputClass + " font-mono text-xs"}
                                    value={form.socials.github}
                                    onChange={(e) =>
                                        setForm({ ...form, socials: { ...form.socials, github: e.target.value } })
                                    }
                                    placeholder="https://github.com/mahdimonir"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5">
                                        <Linkedin className="w-3.5 h-3.5 text-cyan-400" /> LinkedIn URL
                                    </span>
                                </label>
                                <input
                                    className={inputClass + " font-mono text-xs"}
                                    value={form.socials.linkedin}
                                    onChange={(e) =>
                                        setForm({ ...form, socials: { ...form.socials, linkedin: e.target.value } })
                                    }
                                    placeholder="https://www.linkedin.com/in/moniruzzaman-mahdi/"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5">
                                        <Twitter className="w-3.5 h-3.5 text-cyan-400" /> Twitter / X URL
                                    </span>
                                </label>
                                <input
                                    className={inputClass + " font-mono text-xs"}
                                    value={form.socials.twitter}
                                    onChange={(e) =>
                                        setForm({ ...form, socials: { ...form.socials, twitter: e.target.value } })
                                    }
                                    placeholder="https://x.com/Mahdimonir2004"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5">
                                        <Compass className="w-3.5 h-3.5 text-cyan-400" /> 3D Portfolio URL
                                    </span>
                                </label>
                                <input
                                    className={inputClass + " font-mono text-xs"}
                                    value={form.socials.portfolio3d || ""}
                                    onChange={(e) =>
                                        setForm({ ...form, socials: { ...form.socials, portfolio3d: e.target.value } })
                                    }
                                    placeholder="https://3d.mahdimonir.dev"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: SERVICES & SPECIALIZATIONS (FOCUS AREAS) */}
            {activeTab === "services" && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-cyan-400" />
                                <span>Engineering Services &amp; Specializations ({form.specializations.length})</span>
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Architectural capabilities, technologies, and deliverables rendered in Section 04 on /about.
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
                        {form.specializations.map((spec, i) => (
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
                                                setForm({
                                                    ...form,
                                                    specializations: form.specializations.filter(
                                                        (_, idx) => idx !== i
                                                    ),
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
                                                const next = [...form.specializations];
                                                next[i].title = e.target.value;
                                                setForm({ ...form, specializations: next });
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
                                                const next = [...form.specializations];
                                                next[i].skills = e.target.value
                                                    .split(",")
                                                    .map((s) => s.trim())
                                                    .filter(Boolean);
                                                setForm({ ...form, specializations: next });
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
                                            const next = [...form.specializations];
                                            next[i].description = e.target.value;
                                            setForm({ ...form, specializations: next });
                                        }}
                                        placeholder="Detailed technical explanation of what you build and the architectural approaches used..."
                                    />
                                </div>

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
                                                const next = [...form.specializations];
                                                next[i].points = [
                                                    ...(next[i].points || []),
                                                    "New deliverable or architectural highlight",
                                                ];
                                                setForm({ ...form, specializations: next });
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
                                                        const next = [...form.specializations];
                                                        next[i].points![ptIdx] = e.target.value;
                                                        setForm({ ...form, specializations: next });
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = [...form.specializations];
                                                        next[i].points = next[i].points!.filter((_, idx) => idx !== ptIdx);
                                                        setForm({ ...form, specializations: next });
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

            {/* TAB 3: WORK EXPERIENCE */}
            {activeTab === "experience" && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold uppercase tracking-wider text-white">
                                Work Experience Timeline ({form.experience.length})
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Chronological history rendered under Section 01 on /about.
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
                        {form.experience.map((exp, i) => (
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
                                                setForm({
                                                    ...form,
                                                    experience: form.experience.filter((_, idx) => idx !== i),
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
                                                const next = [...form.experience];
                                                next[i].company = e.target.value;
                                                setForm({ ...form, experience: next });
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
                                                const next = [...form.experience];
                                                next[i].role = e.target.value;
                                                setForm({ ...form, experience: next });
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
                                                const next = [...form.experience];
                                                next[i].period = e.target.value;
                                                setForm({ ...form, experience: next });
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
                                                const next = [...form.experience];
                                                next[i].location = e.target.value;
                                                setForm({ ...form, experience: next });
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
                                                const next = [...form.experience];
                                                next[i].companyUrl = e.target.value;
                                                setForm({ ...form, experience: next });
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
                                                    const next = [...form.experience];
                                                    next[i].current = e.target.checked;
                                                    setForm({ ...form, experience: next });
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
                                            const next = [...form.experience];
                                            next[i].description = e.target.value;
                                            setForm({ ...form, experience: next });
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
                                                const next = [...form.experience];
                                                next[i].achievements = [...(next[i].achievements || []), "New achievement point"];
                                                setForm({ ...form, experience: next });
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
                                                        const next = [...form.experience];
                                                        next[i].achievements[achIdx] = e.target.value;
                                                        setForm({ ...form, experience: next });
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = [...form.experience];
                                                        next[i].achievements = next[i].achievements.filter((_, idx) => idx !== achIdx);
                                                        setForm({ ...form, experience: next });
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

            {/* TAB 4: EDUCATION & CERTIFICATIONS */}
            {activeTab === "credentials" && (
                <div className="flex flex-col gap-8">
                    {/* Degrees List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold uppercase tracking-wider text-white">
                                    Formal Degrees ({form.education.length})
                                </h2>
                                <p className="text-xs text-zinc-400">
                                    Academic credentials rendered under Section 05 on /about.
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
                            {form.education.map((edu, i) => (
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
                                                    setForm({
                                                        ...form,
                                                        education: form.education.filter((_, idx) => idx !== i),
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
                                                    const next = [...form.education];
                                                    next[i].institution = e.target.value;
                                                    setForm({ ...form, education: next });
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
                                                    const next = [...form.education];
                                                    next[i].degree = e.target.value;
                                                    setForm({ ...form, education: next });
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
                                                    const next = [...form.education];
                                                    next[i].period = e.target.value;
                                                    setForm({ ...form, education: next });
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
                                                    const next = [...form.education];
                                                    next[i].current = e.target.checked;
                                                    setForm({ ...form, education: next });
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

                    {/* Courses List */}
                    <div className="space-y-4 pt-6 border-t border-zinc-800/70">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold uppercase tracking-wider text-white">
                                    Verified Courses &amp; Certifications ({form.courses.length})
                                </h2>
                                <p className="text-xs text-zinc-400">
                                    Industry certifications with verification URLs rendered on /about.
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
                            {form.courses.map((crs, i) => (
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
                                                    setForm({
                                                        ...form,
                                                        courses: form.courses.filter((_, idx) => idx !== i),
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
                                                    const next = [...form.courses];
                                                    next[i].title = e.target.value;
                                                    setForm({ ...form, courses: next });
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
                                                    const next = [...form.courses];
                                                    next[i].institution = e.target.value;
                                                    setForm({ ...form, courses: next });
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
                                                    const next = [...form.courses];
                                                    next[i].period = e.target.value;
                                                    setForm({ ...form, courses: next });
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
                                                const next = [...form.courses];
                                                next[i].certificateUrl = e.target.value;
                                                setForm({ ...form, courses: next });
                                            }}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProfileAboutDashboardPage() {
    return (
        <Suspense fallback={<DashboardFormSkeleton title="Profile & About" />}>
            <ProfileAboutInner />
        </Suspense>
    );
}
