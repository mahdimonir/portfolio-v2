"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { optimizeImageUrl } from "@/lib/image-utils";
import {
    ArrowLeft,
    Save,
    Upload,
    Plus,
    Trash2,
    ExternalLink,
    Star,
    Layers,
    Cpu,
    FileText,
    Image as ImageIcon,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    Globe,
    Code,
    Sparkles,
    Copy,
    Eye,
    RefreshCw,
    Tag,
    ListChecks,
} from "lucide-react";

export interface ProjectTech {
    name: string;
    category: string;
    iconUrl?: string | null;
}

export interface ProjectVariantItem {
    id?: number | string;
    name: string;
    badge?: string | null;
    previewImage?: string | null;
    liveUrl?: string | null;
    order?: number;
}

export interface ProjectFormData {
    id?: string;
    slug: string;
    title: string;
    tagline: string;
    stack: string;
    description: string;
    longDescription: string;
    image: string;
    images: string[];
    links: {
        live?: string | null;
        code?: string | null;
        api?: string | null;
        play_store?: string | null;
        app_store?: string | null;
    };
    cta: string;
    category: string;
    role: string;
    duration: string;
    client: string;
    status: string;
    featured: boolean;
    features: string[];
    tech: ProjectTech[];
    variants: ProjectVariantItem[];
}

interface CategoryOption {
    id: number;
    slug: string;
    label: string;
}

interface MasterTech {
    id: number;
    name: string;
    role: string;
    iconUrl?: string | null;
}

interface ProjectEditorProps {
    mode: "create" | "edit";
    slug?: string;
}

type EditorTab = "general" | "media" | "variants" | "tech" | "story";

export default function ProjectEditor({ mode, slug }: ProjectEditorProps) {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<EditorTab>("general");
    const [loading, setLoading] = useState(mode === "edit");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
    const [uploadProgressText, setUploadProgressText] = useState("");
    const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

    // Form data state
    const [formData, setFormData] = useState<ProjectFormData>({
        slug: "",
        title: "",
        tagline: "",
        stack: "",
        description: "",
        longDescription: "",
        image: "",
        images: [],
        links: {
            live: "",
            code: "",
            api: "",
            play_store: "",
            app_store: "",
        },
        cta: "View Project",
        category: "Full Stack",
        role: "Full Stack Lead",
        duration: "3 Months",
        client: "Client Project",
        status: "Completed",
        featured: false,
        features: [],
        tech: [],
        variants: [
            {
                name: "Main Edition",
                badge: "Production Release",
                previewImage: "",
                liveUrl: "",
                order: 0,
            },
        ],
    });

    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [masterTechs, setMasterTechs] = useState<MasterTech[]>([]);

    // Media helpers
    const [pastedImageUrl, setPastedImageUrl] = useState("");
    const [customTechInput, setCustomTechInput] = useState({ name: "", category: "Frontend" });
    const [newFeatureInput, setNewFeatureInput] = useState("");
    const [variantUploadIdx, setVariantUploadIdx] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const variantFileInputRef = useRef<HTMLInputElement | null>(null);

    // 1. Fetch initial metadata (categories & tech stacks) and project (if edit mode)
    const loadData = useCallback(async () => {
        try {
            const [catRes, techRes] = await Promise.all([
                fetch("/api/categories").catch(() => null),
                fetch("/api/tech-stacks").catch(() => null),
            ]);

            const catData = catRes && catRes.ok ? await catRes.json().catch(() => []) : [];
            const techData = techRes && techRes.ok ? await techRes.json().catch(() => []) : [];

            if (Array.isArray(catData)) setCategories(catData);
            if (Array.isArray(techData)) setMasterTechs(techData);

            if (mode === "edit" && slug) {
                // Fetch single project data
                const projRes = await fetch(`/api/projects/${encodeURIComponent(slug)}`);
                if (projRes.ok) {
                    const data = await projRes.json();
                    
                    // Normalize images
                    let imgs: string[] = [];
                    if (Array.isArray(data.images)) {
                        imgs = data.images.map((img: any) => (typeof img === "string" ? img : img.url)).filter(Boolean);
                    }
                    if (imgs.length === 0 && data.coverImage) {
                        imgs = [data.coverImage];
                    }

                    // Normalize features
                    let feats: string[] = [];
                    if (Array.isArray(data.features)) {
                        feats = data.features.map((f: any) => (typeof f === "string" ? f : f.text)).filter(Boolean);
                    }

                    // Normalize tech
                    let techs: ProjectTech[] = [];
                    if (Array.isArray(data.tech)) {
                        techs = data.tech;
                    } else if (Array.isArray(data.techStacks)) {
                        techs = data.techStacks.map((ts: any) => ({
                            name: ts.techStack?.name || "",
                            category: ts.techStack?.role || "Tech",
                            iconUrl: ts.techStack?.iconUrl || null,
                        })).filter((t: ProjectTech) => Boolean(t.name));
                    }

                    // Normalize variants
                    let vars: ProjectVariantItem[] = [];
                    if (Array.isArray(data.variants) && data.variants.length > 0) {
                        vars = data.variants.map((v: any, idx: number) => ({
                            id: v.id,
                            name: v.name || `Edition ${idx + 1}`,
                            badge: v.badge || null,
                            previewImage: v.previewImage || null,
                            liveUrl: v.liveUrl || null,
                            order: v.order !== undefined ? v.order : idx,
                        }));
                    } else {
                        vars = [
                            {
                                name: "Main Edition",
                                badge: "Production Release",
                                previewImage: data.coverImage || imgs[0] || "",
                                liveUrl: data.liveUrl || "",
                                order: 0,
                            },
                        ];
                    }

                    setFormData({
                        id: String(data.id || ""),
                        slug: data.slug || slug,
                        title: data.title || "",
                        tagline: data.tagline || "",
                        stack: data.stack || "",
                        description: data.description || "",
                        longDescription: data.longDescription || "",
                        image: data.coverImage || imgs[0] || "",
                        images: imgs,
                        links: {
                            live: data.liveUrl || "",
                            code: data.codeUrl || "",
                            api: data.apiUrl || "",
                            play_store: data.playStoreUrl || "",
                            app_store: data.appStoreUrl || "",
                            ...(data.links || {}),
                        },
                        cta: data.cta || "View Project",
                        category: data.category?.label || data.category || (catData[0]?.label || "Full Stack"),
                        role: data.role || "Full Stack Lead",
                        duration: data.duration || "3 Months",
                        client: data.client || "Client Project",
                        status: data.status || "Completed",
                        featured: Boolean(data.featured),
                        features: feats,
                        tech: techs,
                        variants: vars,
                    });
                } else {
                    toast.error("Project not found");
                    router.push("/dashboard/projects");
                }
            } else if (mode === "create") {
                // Initialize default category
                if (catData.length > 0) {
                    setFormData((prev) => ({ ...prev, category: catData[0].label }));
                }
            }
        } catch (err) {
            console.error("Failed to load project editor data:", err);
            toast.error("Failed to load project details");
        } finally {
            setLoading(false);
        }
    }, [mode, slug, router]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Keyboard shortcut: Ctrl+S / Cmd+S to save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    // Auto-generate slug from title for new projects
    const handleTitleChange = (val: string) => {
        setFormData((prev) => {
            const next = { ...prev, title: val };
            if (mode === "create" && (!prev.slug || prev.slug === slugify(prev.title))) {
                next.slug = slugify(val);
            }
            return next;
        });
    };

    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    // =========================================================================
    // IMAGE & GALLERY MANAGEMENT (World-class, rock-solid handling)
    // =========================================================================

    // Multi-file upload to Cloudinary
    const handleFilesUpload = async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        if (fileArray.length === 0) return;

        setIsUploadingMultiple(true);
        const uploadedUrls: string[] = [];

        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            setUploadProgressText(`Uploading ${i + 1} of ${fileArray.length}: ${file.name}...`);

            try {
                const formDataUpload = new FormData();
                formDataUpload.append("file", file);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.url) {
                        uploadedUrls.push(data.url);
                    }
                } else {
                    toast.error(`Failed to upload ${file.name}`);
                }
            } catch {
                toast.error(`Network error uploading ${file.name}`);
            }
        }

        if (uploadedUrls.length > 0) {
            setFormData((prev) => {
                const nextImages = [...prev.images, ...uploadedUrls];
                const cover = prev.image || nextImages[0] || "";
                // Also assign to Edition #1 preview if empty
                const updatedVariants = [...prev.variants];
                if (updatedVariants[0] && !updatedVariants[0].previewImage) {
                    updatedVariants[0] = { ...updatedVariants[0], previewImage: nextImages[0] };
                }
                return {
                    ...prev,
                    images: nextImages,
                    image: cover,
                    variants: updatedVariants,
                };
            });
            toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)!`);
        }

        setIsUploadingMultiple(false);
        setUploadProgressText("");
    };

    // Direct image URL addition
    const handleAddPastedImageUrl = () => {
        const url = pastedImageUrl.trim();
        if (!url) return;
        setFormData((prev) => {
            const nextImages = [...prev.images, url];
            const cover = prev.image || nextImages[0] || "";
            return {
                ...prev,
                images: nextImages,
                image: cover,
            };
        });
        setPastedImageUrl("");
        toast.success("Image URL added to gallery!");
    };

    // Promote image to #1 (Primary Cover)
    const handleSetCover = (index: number) => {
        if (index === 0) return;
        setFormData((prev) => {
            const nextImages = [...prev.images];
            const [selected] = nextImages.splice(index, 1);
            nextImages.unshift(selected);
            return {
                ...prev,
                images: nextImages,
                image: selected,
            };
        });
        toast.success("Image promoted to Primary Cover (#1)");
    };

    // Reorder gallery images
    const handleMoveImage = (from: number, to: number) => {
        setFormData((prev) => {
            if (to < 0 || to >= prev.images.length) return prev;
            const nextImages = [...prev.images];
            const temp = nextImages[from];
            nextImages[from] = nextImages[to];
            nextImages[to] = temp;
            return {
                ...prev,
                images: nextImages,
                image: nextImages[0] || "",
            };
        });
    };

    // Remove image from gallery
    const handleRemoveImage = (index: number) => {
        setFormData((prev) => {
            const nextImages = prev.images.filter((_, i) => i !== index);
            return {
                ...prev,
                images: nextImages,
                image: nextImages[0] || "",
            };
        });
        toast.info("Image removed from gallery");
    };

    // Upload specific variant screenshot
    const handleVariantScreenshotUpload = async (variantIdx: number, file: File) => {
        const toastId = toast.loading(`Uploading screenshot for Edition #${variantIdx + 1}...`);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    setFormData((prev) => {
                        const updatedVariants = [...prev.variants];
                        if (updatedVariants[variantIdx]) {
                            updatedVariants[variantIdx] = {
                                ...updatedVariants[variantIdx],
                                previewImage: data.url,
                            };
                        }
                        const updates: Partial<ProjectFormData> = {
                            variants: updatedVariants,
                        };
                        // If it's the primary variant and no gallery images exist, add to gallery as well
                        if (variantIdx === 0 && prev.images.length === 0) {
                            updates.images = [data.url];
                            updates.image = data.url;
                        }
                        return { ...prev, ...updates };
                    });
                    toast.success("Variant screenshot updated!", { id: toastId });
                }
            } else {
                toast.error("Failed to upload variant screenshot", { id: toastId });
            }
        } catch {
            toast.error("Network error during screenshot upload", { id: toastId });
        } finally {
            setVariantUploadIdx(null);
        }
    };

    // =========================================================================
    // SAVE LOGIC (Granular PUT / POST with clean schema alignment)
    // =========================================================================
    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error("Project title is required");
            setActiveTab("general");
            return;
        }

        if (!formData.slug.trim()) {
            toast.error("Project slug is required");
            setActiveTab("general");
            return;
        }

        setIsSaving(true);

        // Normalize variants to guarantee at least 1 edition
        const finalVariants = formData.variants.length > 0
            ? formData.variants
            : [
                {
                    name: "Main Edition",
                    badge: "Production Release",
                    previewImage: formData.image || formData.images[0] || "",
                    liveUrl: formData.links.live || "",
                    order: 0,
                },
            ];

        // Ensure primary variant liveUrl syncs with project.links.live if specified
        const primaryVariant = finalVariants[0];
        const primaryLiveUrl = primaryVariant?.liveUrl || formData.links.live || "";
        const primaryCoverImage = formData.image || primaryVariant?.previewImage || formData.images[0] || "";

        const payload = {
            ...formData,
            newSlug: formData.slug.trim(),
            coverImage: primaryCoverImage,
            image: primaryCoverImage,
            images: formData.images,
            liveUrl: primaryLiveUrl,
            codeUrl: formData.links.code || null,
            apiUrl: formData.links.api || null,
            playStoreUrl: formData.links.play_store || null,
            appStoreUrl: formData.links.app_store || null,
            variants: finalVariants,
            links: {
                ...formData.links,
                live: primaryLiveUrl,
            },
        };

        try {
            if (mode === "edit" && slug) {
                // PUT /api/projects/[slug]
                const res = await fetch(`/api/projects/${encodeURIComponent(slug)}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    toast.success("Project updated successfully!");
                    router.push("/dashboard/projects");
                    router.refresh();
                } else {
                    const err = await res.json().catch(() => ({}));
                    toast.error(err.error || "Failed to update project");
                }
            } else {
                // POST /api/projects
                const res = await fetch("/api/projects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    toast.success("Project created successfully!");
                    router.push("/dashboard/projects");
                    router.refresh();
                } else {
                    const err = await res.json().catch(() => ({}));
                    toast.error(err.error || "Failed to create project");
                }
            }
        } catch {
            toast.error("Network error while saving project");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">Loading project configuration...</p>
            </div>
        );
    }

    const inputClass =
        "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors";
    const labelClass =
        "text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between";

    return (
        <div className="min-h-screen bg-[#070709] text-zinc-200 pb-24">
            {/* STICKY TOP APP BAR */}
            <header className="sticky top-0 z-40 bg-[#0e0e11]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 transition-all">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Back Link & Title */}
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            href="/dashboard/projects"
                            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0"
                            title="Back to Catalog"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                                    {mode === "create" ? "Project Builder" : "Project Editor"}
                                </span>
                                <span className="text-zinc-600">•</span>
                                <span className="text-[10px] font-mono text-zinc-500">
                                    {mode === "create" ? "New Record" : `/${formData.slug}`}
                                </span>
                            </div>
                            <h1 className="text-base sm:text-lg font-black uppercase text-white truncate max-w-md">
                                {formData.title || "Untitled Project"}
                            </h1>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {mode === "edit" && formData.slug && (
                            <Link
                                href={`/projects/${formData.slug}`}
                                target="_blank"
                                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">View Public</span>
                            </Link>
                        )}

                        <Link
                            href="/dashboard/projects"
                            className="px-3.5 py-1.5 rounded-lg border border-transparent text-zinc-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                            Cancel
                        </Link>

                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{mode === "create" ? "Publish Project" : "Save Changes"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT WRAPPER */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
                {/* HORIZONTAL TAB NAVIGATION */}
                <div className="flex items-center gap-1 border-b border-zinc-800/80 mb-8 overflow-x-auto pb-px">
                    <button
                        type="button"
                        onClick={() => setActiveTab("general")}
                        className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                            activeTab === "general"
                                ? "border-cyan-400 text-cyan-400"
                                : "border-transparent text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                        <Tag className="w-3.5 h-3.5" />
                        <span>1. Overview & Identity</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("media")}
                        className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                            activeTab === "media"
                                ? "border-cyan-400 text-cyan-400"
                                : "border-transparent text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>2. Gallery & Media ({formData.images.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("variants")}
                        className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                            activeTab === "variants"
                                ? "border-cyan-400 text-cyan-400"
                                : "border-transparent text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>3. Editions & Variants ({formData.variants.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("tech")}
                        className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                            activeTab === "tech"
                                ? "border-cyan-400 text-cyan-400"
                                : "border-transparent text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>4. Tech & Accomplishments ({formData.tech.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("story")}
                        className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                            activeTab === "story"
                                ? "border-cyan-400 text-cyan-400"
                                : "border-transparent text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>5. Case Study & Copy</span>
                    </button>
                </div>

                {/* ========================================================================= */}
                {/* TAB 1: OVERVIEW & IDENTITY */}
                {/* ========================================================================= */}
                {activeTab === "general" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800/80 pb-3 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-cyan-400" />
                                    <span>Core Identification</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Project Title</label>
                                        <input
                                            className={inputClass + " text-base font-bold"}
                                            value={formData.title}
                                            onChange={(e) => handleTitleChange(e.target.value)}
                                            placeholder="e.g. MUOUZIK - Universal Music Platform"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            <span>URL Slug (Unique)</span>
                                            {mode === "create" && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData((p) => ({ ...p, slug: slugify(p.title) }))}
                                                    className="text-[9px] text-cyan-400 hover:underline"
                                                >
                                                    Regenerate from Title
                                                </button>
                                            )}
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">/</span>
                                            <input
                                                className={inputClass + " pl-6 font-mono"}
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                placeholder="muouzik-music-platform"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Category</label>
                                        <select
                                            className={inputClass}
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.label}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Tagline Subtitle</label>
                                        <input
                                            className={inputClass}
                                            value={formData.tagline}
                                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                            placeholder="e.g. Next-generation scalable streaming ecosystem for Francophone and global artists"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional External Links */}
                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800/80 pb-3 flex items-center gap-2">
                                    <Code className="w-4 h-4 text-cyan-400" />
                                    <span>Code Repositories & Store Links</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Source Code URL (GitHub)</label>
                                        <input
                                            className={inputClass + " font-mono text-xs"}
                                            value={formData.links.code || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    links: { ...formData.links, code: e.target.value },
                                                })
                                            }
                                            placeholder="https://github.com/username/project"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Swagger / API Specs URL</label>
                                        <input
                                            className={inputClass + " font-mono text-xs"}
                                            value={formData.links.api || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    links: { ...formData.links, api: e.target.value },
                                                })
                                            }
                                            placeholder="https://api.example.com/docs"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Google Play Store URL</label>
                                        <input
                                            className={inputClass + " font-mono text-xs"}
                                            value={formData.links.play_store || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    links: { ...formData.links, play_store: e.target.value },
                                                })
                                            }
                                            placeholder="https://play.google.com/store/apps/..."
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Apple App Store URL</label>
                                        <input
                                            className={inputClass + " font-mono text-xs"}
                                            value={formData.links.app_store || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    links: { ...formData.links, app_store: e.target.value },
                                                })
                                            }
                                            placeholder="https://apps.apple.com/app/..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar: Metadata & Specifications */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800/80 pb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-cyan-400" />
                                    <span>Project Specifications</span>
                                </h3>

                                <div className="flex flex-col gap-3.5">
                                    <div>
                                        <label className={labelClass}>Project Status</label>
                                        <select
                                            className={inputClass}
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Completed">Completed</option>
                                            <option value="In Development">In Development</option>
                                            <option value="Production Live">Production Live</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Role in Project</label>
                                        <input
                                            className={inputClass}
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            placeholder="Lead Full Stack Engineer"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Project Duration</label>
                                        <input
                                            className={inputClass}
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            placeholder="3 Months"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Client Name / Organization</label>
                                        <input
                                            className={inputClass}
                                            value={formData.client}
                                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                            placeholder="Client / Company"
                                        />
                                    </div>

                                    {/* Featured Flag */}
                                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold text-white block">Featured Project</span>
                                            <span className="text-[10px] text-zinc-500">Highlight in top work grid</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: GALLERY & MEDIA (ROBUST, STATE-OF-THE-ART IMAGE MANAGEMENT) */}
                {/* ========================================================================= */}
                {activeTab === "media" && (
                    <div className="flex flex-col gap-6">
                        {/* Hidden input for multi-file upload */}
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) handleFilesUpload(e.target.files);
                                if (e.target) e.target.value = "";
                            }}
                        />

                        {/* Top Control Bar with Multi-Dropzone */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-cyan-400" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                                            Project Gallery Showcase ({formData.images.length} Assets)
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 mt-1">
                                        Standard ratio: 16:9 widescreen (1920×1080). Image #1 automatically serves as the primary cover across the entire portfolio.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={isUploadingMultiple}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>{isUploadingMultiple ? "Uploading..." : "Upload Multiple Images"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Dropzone Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (e.dataTransfer.files) handleFilesUpload(e.dataTransfer.files);
                                }}
                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                    isUploadingMultiple
                                        ? "border-cyan-500 bg-cyan-950/10 text-cyan-300"
                                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/30 text-zinc-400"
                                }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 mb-3 shadow-sm">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">
                                    {isUploadingMultiple ? uploadProgressText : "Drop Images Here or Click to Browse"}
                                </h4>
                                <p className="text-[11px] text-zinc-500 max-w-sm">
                                    Select single or multiple screenshots (PNG, JPG, WebP) to upload directly to Cloudinary.
                                </p>
                            </div>

                            {/* Or Paste Direct Image URL */}
                            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                                <span className="text-[10px] font-mono uppercase text-zinc-500 whitespace-nowrap">Or Add via URL:</span>
                                <input
                                    type="url"
                                    value={pastedImageUrl}
                                    onChange={(e) => setPastedImageUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddPastedImageUrl();
                                        }
                                    }}
                                    placeholder="https://res.cloudinary.com/... or paste image URL"
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 font-mono focus:outline-none focus:border-cyan-500"
                                />
                                <button
                                    type="button"
                                    disabled={!pastedImageUrl.trim()}
                                    onClick={handleAddPastedImageUrl}
                                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white rounded-lg text-xs font-bold transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Gallery Image Grid with Visual Controls */}
                        {formData.images.length === 0 ? (
                            <div className="py-16 text-center border border-dashed border-zinc-850 rounded-2xl bg-zinc-950/30 flex flex-col items-center justify-center gap-2 text-zinc-500">
                                <ImageIcon className="w-8 h-8 text-zinc-700" />
                                <p className="text-xs font-mono uppercase tracking-wider">No images uploaded yet</p>
                                <p className="text-[11px] text-zinc-600 max-w-sm">
                                    Add your first screenshot above to feature it in the interactive device mockup on the project detail view.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {formData.images.map((imgUrl, imgIdx) => {
                                    const isCover = imgIdx === 0;

                                    return (
                                        <div
                                            key={imgIdx}
                                            className={`rounded-xl border overflow-hidden bg-zinc-950 flex flex-col transition-all group ${
                                                isCover
                                                    ? "border-amber-400 ring-2 ring-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.12)]"
                                                    : "border-zinc-800 hover:border-zinc-700"
                                            }`}
                                        >
                                            {/* Image Preview Canvas */}
                                            <div className="relative aspect-[16/9] w-full bg-black overflow-hidden flex items-center justify-center border-b border-zinc-800/80">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={optimizeImageUrl(imgUrl, { width: 500 })}
                                                    alt={`Asset ${imgIdx + 1}`}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                                                    onError={(e) => {
                                                        (e.target as HTMLElement).style.opacity = "0.2";
                                                    }}
                                                />

                                                {/* Floating Overlay Badges */}
                                                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                                                    {isCover ? (
                                                        <span className="pointer-events-auto px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                                                            <Star className="w-2.5 h-2.5 fill-current" /> Cover (#1)
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetCover(imgIdx)}
                                                            className="pointer-events-auto px-2 py-0.5 rounded-full bg-black/80 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-400/40 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all backdrop-blur-md opacity-90 group-hover:opacity-100 shadow"
                                                            title="Set as Primary Cover"
                                                        >
                                                            <Star className="w-2.5 h-2.5 fill-current" />
                                                            <span>Set Cover</span>
                                                        </button>
                                                    )}

                                                    <div className="flex items-center gap-1 pointer-events-auto">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewModalImage(imgUrl)}
                                                            className="p-1 bg-black/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded backdrop-blur-md transition-colors"
                                                            title="View Full Size"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(imgIdx)}
                                                            className="p-1 bg-black/80 hover:bg-rose-500 text-zinc-400 hover:text-white rounded backdrop-blur-md transition-colors"
                                                            title="Remove image"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Strip: Index, URL & Reorder */}
                                            <div className="px-3 py-2 bg-zinc-900/90 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 shrink-0">
                                                        #{imgIdx + 1}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[160px]" title={imgUrl}>
                                                        {imgUrl}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(imgUrl);
                                                            toast.success("Image URL copied to clipboard!");
                                                        }}
                                                        className="text-zinc-500 hover:text-zinc-200 p-0.5"
                                                        title="Copy URL"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-0.5 shrink-0">
                                                    <button
                                                        type="button"
                                                        disabled={imgIdx === 0}
                                                        onClick={() => handleMoveImage(imgIdx, imgIdx - 1)}
                                                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
                                                        title="Move earlier"
                                                    >
                                                        <ChevronLeft className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={imgIdx === formData.images.length - 1}
                                                        onClick={() => handleMoveImage(imgIdx, imgIdx + 1)}
                                                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white disabled:opacity-20 transition-colors"
                                                        title="Move later"
                                                    >
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: EDITIONS & VARIANTS */}
                {/* ========================================================================= */}
                {activeTab === "variants" && (
                    <div className="flex flex-col gap-6">
                        {/* Hidden variant file input */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={variantFileInputRef}
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && variantUploadIdx !== null) {
                                    handleVariantScreenshotUpload(variantUploadIdx, file);
                                }
                                if (e.target) e.target.value = "";
                            }}
                        />

                        {/* Top Bar */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-cyan-400" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                                        Platform Editions & Variants ({formData.variants.length})
                                    </h3>
                                </div>
                                <p className="text-[11px] text-zinc-400 mt-1 max-w-xl">
                                    Every project has at least 1 edition (Edition #1 provides the primary cover & live link). Add variants for multi-region versions, client white-label deployments, or color themes (e.g. Muouzik vs GensVictrix, Orange vs Blue).
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    const current = formData.variants;
                                    const newVariant: ProjectVariantItem = {
                                        name: `Edition ${current.length + 1}`,
                                        badge: current.length === 0 ? "Production Release" : "Alternative Edition",
                                        previewImage: "",
                                        liveUrl: "",
                                        order: current.length,
                                    };
                                    setFormData({ ...formData, variants: [...current, newVariant] });
                                }}
                                className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Edition
                            </button>
                        </div>

                        {/* Variant Cards */}
                        <div className="flex flex-col gap-5">
                            {formData.variants.map((v, vIdx) => {
                                const isPrimary = vIdx === 0;

                                return (
                                    <div
                                        key={vIdx}
                                        className={`rounded-2xl border p-5 sm:p-6 flex flex-col gap-5 transition-all ${
                                            isPrimary
                                                ? "bg-zinc-900/80 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.06)]"
                                                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                                        }`}
                                    >
                                        {/* Card Header Row */}
                                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                                            <div className="flex items-center gap-2.5">
                                                <span
                                                    className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded flex items-center gap-1.5 ${
                                                        isPrimary
                                                            ? "bg-cyan-400 text-black shadow-sm"
                                                            : "bg-zinc-800 text-zinc-300"
                                                    }`}
                                                >
                                                    {isPrimary && <Star className="w-2.5 h-2.5 fill-current" />}
                                                    Edition #{vIdx + 1}
                                                    {isPrimary && " (Primary Platform)"}
                                                </span>
                                                <span className="text-xs font-bold text-white">
                                                    {v.name || "Untitled Edition"}
                                                </span>
                                                {v.badge && (
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 hidden sm:inline-block">
                                                        {v.badge}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {/* Reorder Buttons */}
                                                <button
                                                    type="button"
                                                    disabled={vIdx === 0}
                                                    onClick={() => {
                                                        const updated = [...formData.variants];
                                                        const temp = updated[vIdx - 1];
                                                        updated[vIdx - 1] = updated[vIdx];
                                                        updated[vIdx] = temp;
                                                        setFormData({ ...formData, variants: updated });
                                                    }}
                                                    className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-20 rounded hover:bg-zinc-800 transition-colors"
                                                    title="Move Up"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={vIdx === formData.variants.length - 1}
                                                    onClick={() => {
                                                        const updated = [...formData.variants];
                                                        const temp = updated[vIdx + 1];
                                                        updated[vIdx + 1] = updated[vIdx];
                                                        updated[vIdx] = temp;
                                                        setFormData({ ...formData, variants: updated });
                                                    }}
                                                    className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-20 rounded hover:bg-zinc-800 transition-colors"
                                                    title="Move Down"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Delete Variant */}
                                                <button
                                                    type="button"
                                                    disabled={formData.variants.length <= 1}
                                                    onClick={() => {
                                                        const updated = formData.variants.filter((_, i) => i !== vIdx);
                                                        setFormData({ ...formData, variants: updated });
                                                    }}
                                                    className="p-1.5 text-zinc-400 hover:text-rose-400 disabled:opacity-20 rounded hover:bg-rose-500/10 ml-1 transition-colors"
                                                    title={formData.variants.length <= 1 ? "At least 1 edition required" : "Delete Edition"}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Fields Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Edition Name</label>
                                                <input
                                                    className={inputClass}
                                                    value={v.name}
                                                    onChange={(e) => {
                                                        const updated = [...formData.variants];
                                                        updated[vIdx] = { ...updated[vIdx], name: e.target.value };
                                                        setFormData({ ...formData, variants: updated });
                                                    }}
                                                    placeholder="e.g. Muouzik, Orange Theme, V1..."
                                                />
                                            </div>

                                            <div>
                                                <label className={labelClass}>Badge / Subtitle (Optional)</label>
                                                <input
                                                    className={inputClass}
                                                    value={v.badge || ""}
                                                    onChange={(e) => {
                                                        const updated = [...formData.variants];
                                                        updated[vIdx] = { ...updated[vIdx], badge: e.target.value };
                                                        setFormData({ ...formData, variants: updated });
                                                    }}
                                                    placeholder="e.g. West Africa / Francophone, Warm Dynamic Palette..."
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className={labelClass}>Live Deployment URL</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        className={inputClass + " font-mono text-xs flex-1"}
                                                        value={v.liveUrl || ""}
                                                        onChange={(e) => {
                                                            const updated = [...formData.variants];
                                                            updated[vIdx] = { ...updated[vIdx], liveUrl: e.target.value };
                                                            const updates: Partial<ProjectFormData> = { variants: updated };
                                                            if (vIdx === 0) {
                                                                updates.links = { ...formData.links, live: e.target.value };
                                                            }
                                                            setFormData({ ...formData, ...updates });
                                                        }}
                                                        placeholder="https://example.com"
                                                    />
                                                    {v.liveUrl && (
                                                        <a
                                                            href={v.liveUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors shrink-0"
                                                            title="Test URL"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Dedicated Screenshot Picker / Uploader */}
                                            <div className="sm:col-span-2">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className={labelClass + " mb-0"}>
                                                        Variant Screenshot Asset
                                                    </label>
                                                    {formData.images.length > 0 && (
                                                        <span className="text-[10px] text-zinc-500">
                                                            Can select from gallery or upload custom
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                    <div className="flex items-center gap-2 flex-1 w-full">
                                                        <input
                                                            className={inputClass + " font-mono text-xs flex-1"}
                                                            value={v.previewImage || ""}
                                                            onChange={(e) => {
                                                                const updated = [...formData.variants];
                                                                updated[vIdx] = { ...updated[vIdx], previewImage: e.target.value };
                                                                setFormData({ ...formData, variants: updated });
                                                            }}
                                                            placeholder="https://res.cloudinary.com/... or paste image URL"
                                                        />

                                                        {/* Pick from existing gallery dropdown */}
                                                        {formData.images.length > 0 && (
                                                            <select
                                                                className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
                                                                value=""
                                                                onChange={(e) => {
                                                                    if (e.target.value) {
                                                                        const updated = [...formData.variants];
                                                                        updated[vIdx] = { ...updated[vIdx], previewImage: e.target.value };
                                                                        setFormData({ ...formData, variants: updated });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Pick from Gallery...</option>
                                                                {formData.images.map((img, i) => (
                                                                    <option key={i} value={img}>
                                                                        Image #{i + 1}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}

                                                        {/* Direct Upload button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setVariantUploadIdx(vIdx);
                                                                variantFileInputRef.current?.click();
                                                            }}
                                                            className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-sm"
                                                        >
                                                            <Upload className="w-3.5 h-3.5" />
                                                            <span>Upload</span>
                                                        </button>
                                                    </div>

                                                    {/* Screenshot Thumbnail Preview */}
                                                    {v.previewImage && (
                                                        <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-black border border-zinc-700/80 shrink-0 shadow group">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={optimizeImageUrl(v.previewImage, { width: 300, crop: "fill" })}
                                                                alt={v.name}
                                                                loading="lazy"
                                                                decoding="async"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLElement).style.opacity = "0.2";
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...formData.variants];
                                                                    updated[vIdx] = { ...updated[vIdx], previewImage: "" };
                                                                    setFormData({ ...formData, variants: updated });
                                                                }}
                                                                className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-500 text-zinc-300 hover:text-white rounded transition-colors opacity-0 group-hover:opacity-100"
                                                                title="Clear Image"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 4: TECH & ACCOMPLISHMENTS */}
                {/* ========================================================================= */}
                {activeTab === "tech" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Tech Stacks Selection */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800/80 pb-3 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-cyan-400" />
                                    <span>Active Tech Stack ({formData.tech.length})</span>
                                </span>
                            </h3>

                            {/* Add from Master Techs */}
                            <div className="flex items-center gap-2">
                                <select
                                    className={inputClass + " flex-1"}
                                    value=""
                                    onChange={(e) => {
                                        const found = masterTechs.find((t) => t.name === e.target.value);
                                        if (found && !formData.tech.some((t) => t.name === found.name)) {
                                            setFormData({
                                                ...formData,
                                                tech: [
                                                    ...formData.tech,
                                                    { name: found.name, category: found.role, iconUrl: found.iconUrl },
                                                ],
                                            });
                                        }
                                    }}
                                >
                                    <option value="">+ Add from Master Tech Stacks...</option>
                                    {masterTechs
                                        .filter((mt) => !formData.tech.some((t) => t.name === mt.name))
                                        .map((mt) => (
                                            <option key={mt.id} value={mt.name}>
                                                {mt.name} ({mt.role})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Add Custom Tech on the fly */}
                            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                                <input
                                    className={inputClass + " flex-1"}
                                    value={customTechInput.name}
                                    onChange={(e) => setCustomTechInput({ ...customTechInput, name: e.target.value })}
                                    placeholder="Or type custom tech..."
                                />
                                <select
                                    className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
                                    value={customTechInput.category}
                                    onChange={(e) => setCustomTechInput({ ...customTechInput, category: e.target.value })}
                                >
                                    <option value="Frontend">Frontend</option>
                                    <option value="Backend">Backend</option>
                                    <option value="Database">Database</option>
                                    <option value="DevOps">DevOps</option>
                                    <option value="Tools">Tools</option>
                                </select>
                                <button
                                    type="button"
                                    disabled={!customTechInput.name.trim()}
                                    onClick={() => {
                                        if (customTechInput.name.trim()) {
                                            setFormData({
                                                ...formData,
                                                tech: [
                                                    ...formData.tech,
                                                    { name: customTechInput.name.trim(), category: customTechInput.category },
                                                ],
                                            });
                                            setCustomTechInput({ name: "", category: "Frontend" });
                                        }
                                    }}
                                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white rounded-lg text-xs font-bold transition-colors"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Tech Badges Chip List */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                {formData.tech.map((t, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 group hover:border-zinc-700"
                                    >
                                        <span>{t.name}</span>
                                        <span className="text-[9px] text-zinc-500 uppercase">{t.category}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    tech: formData.tech.filter((_, i) => i !== idx),
                                                });
                                            }}
                                            className="text-zinc-500 hover:text-rose-400 ml-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Engineering Accomplishments / Features */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-zinc-800/80 pb-3 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <ListChecks className="w-4 h-4 text-cyan-400" />
                                    <span>Engineering Highlights ({formData.features.length})</span>
                                </span>
                            </h3>

                            {/* Add Feature Input */}
                            <div className="flex items-center gap-2">
                                <input
                                    className={inputClass + " flex-1"}
                                    value={newFeatureInput}
                                    onChange={(e) => setNewFeatureInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (newFeatureInput.trim()) {
                                                setFormData({
                                                    ...formData,
                                                    features: [...formData.features, newFeatureInput.trim()],
                                                });
                                                setNewFeatureInput("");
                                            }
                                        }
                                    }}
                                    placeholder="Add accomplishment (e.g. Optimized database queries reducing p99 by 64%)..."
                                />
                                <button
                                    type="button"
                                    disabled={!newFeatureInput.trim()}
                                    onClick={() => {
                                        if (newFeatureInput.trim()) {
                                            setFormData({
                                                ...formData,
                                                features: [...formData.features, newFeatureInput.trim()],
                                            });
                                            setNewFeatureInput("");
                                        }
                                    }}
                                    className="px-3.5 py-2 bg-white text-black hover:bg-zinc-200 disabled:opacity-30 rounded-lg text-xs font-bold uppercase transition-colors shrink-0"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Features List */}
                            <div className="flex flex-col gap-2 pt-2">
                                {formData.features.map((feat, fIdx) => (
                                    <div
                                        key={fIdx}
                                        className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs"
                                    >
                                        <span className="text-cyan-400 font-mono text-xs">#{fIdx + 1}</span>
                                        <input
                                            className="bg-transparent flex-1 text-xs text-white focus:outline-none"
                                            value={feat}
                                            onChange={(e) => {
                                                const updated = [...formData.features];
                                                updated[fIdx] = e.target.value;
                                                setFormData({ ...formData, features: updated });
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    features: formData.features.filter((_, i) => i !== fIdx),
                                                });
                                            }}
                                            className="text-zinc-500 hover:text-rose-400 p-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 5: CASE STUDY & COPY */}
                {/* ========================================================================= */}
                {activeTab === "story" && (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Short Card Summary */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-3">
                            <label className={labelClass}>
                                <span>Short Card Summary (Overview)</span>
                                <span className="text-[9px] text-zinc-500">Displayed on project cards, carousel, & SEO tags</span>
                            </label>
                            <textarea
                                className={inputClass + " min-h-[90px] leading-relaxed"}
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Punchy high-level summary of the application..."
                            />
                        </div>

                        {/* In-Depth Case Study */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-3">
                            <label className={labelClass}>
                                <span>In-Depth Engineering Case Study (Markdown Supported)</span>
                                <span className="text-[9px] text-zinc-500">Full detailed breakdown on the public detail page</span>
                            </label>
                            <textarea
                                className={inputClass + " min-h-[320px] font-mono leading-relaxed"}
                                rows={14}
                                value={formData.longDescription}
                                onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                                placeholder="### Engineering Overview&#10;&#10;Detailed case study examining architectural trade-offs, system design, performance bottlenecks resolved, and business impact..."
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* FULL-IMAGE PREVIEW MODAL */}
            {previewModalImage && (
                <div
                    onClick={() => setPreviewModalImage(null)}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
                >
                    <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewModalImage}
                            alt="Full preview"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
