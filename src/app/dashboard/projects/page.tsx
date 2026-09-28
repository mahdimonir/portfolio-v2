"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
    FolderKanban,
    Plus,
    Search,
    Edit3,
    Trash2,
    Copy,
    ArrowUp,
    ArrowDown,
    Upload,
    ExternalLink,
    Star,
    Layers,
    X,
    Check,
    Save,
    Tag,
    Cpu,
    FileText,
    Image as ImageIcon,
    ListChecks,
    Globe,
    Code,
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export interface ProjectTech {
    name: string;
    category: string;
    iconUrl?: string | null;
}

export interface Project {
    id: string;
    slug: string;
    title: string;
    tagline?: string | null;
    stack: string;
    description: string;
    longDescription?: string | null;
    image: string;
    images: string[];
    links: { live?: string | null; code?: string | null };
    cta: string;
    category: string;
    role?: string | null;
    duration?: string | null;
    client?: string | null;
    status?: string | null;
    featured?: boolean;
    features: string[];
    tech: ProjectTech[];
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

type ModalTab = "basic" | "tech" | "media" | "description" | "features";

export default function ProjectsDashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [masterTechs, setMasterTechs] = useState<MasterTech[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "featured" | "unfeatured">("all");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(6);

    // Modal state for editing or creating project
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);
    const [modalTab, setModalTab] = useState<ModalTab>("basic");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // 1. Load initial data
    const loadData = useCallback(async () => {
        try {
            const [portRes, catRes, techRes] = await Promise.all([
                fetch("/api/portfolio"),
                fetch("/api/categories"),
                fetch("/api/tech-stacks"),
            ]);

            const portData = await portRes.json();
            const catData = await catRes.json();
            const techData = await techRes.json();

            if (Array.isArray(catData)) setCategories(catData);
            if (Array.isArray(techData)) setMasterTechs(techData);

            if (Array.isArray(portData?.projects)) {
                setProjects(
                    portData.projects.map((p: Project) => ({
                        ...p,
                        images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
                        features: Array.isArray(p.features) ? p.features : [],
                        tech: Array.isArray(p.tech) ? p.tech : [],
                    }))
                );
            }
        } catch (err) {
            console.error("Failed to load projects data:", err);
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 2. Persist updated projects array to backend
    const persistProjects = async (updatedProjects: Project[]) => {
        setIsSaving(true);
        try {
            // Fetch current portfolio state first to merge cleanly
            const currentRes = await fetch("/api/portfolio");
            const currentData = await currentRes.json();

            const payload = {
                ...currentData,
                projects: updatedProjects,
            };

            const res = await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setProjects(updatedProjects);
                toast.success("Projects synchronized with database!");
            } else {
                toast.error("Failed to save projects to database.");
            }
        } catch {
            toast.error("Network error while saving projects.");
        } finally {
            setIsSaving(false);
        }
    };

    // 3. Open Modal for Create or Edit
    const handleOpenCreate = () => {
        const defaultCat = categories.length > 0 ? categories[0].label : "Full Stack";
        const newId = String(projects.length + 1).padStart(2, "0");
        const newProject: Project = {
            id: newId,
            slug: `project-${Date.now().toString().slice(-4)}`,
            title: "New Featured Project",
            tagline: "High-performance full stack architecture",
            stack: "React / Node.js / PostgreSQL",
            description: "High-level overview of system architecture, challenges solved, and deliverables.",
            longDescription: "In-depth case study analyzing engineering trade-offs, database optimization, and performance gains.",
            image: "",
            images: [],
            links: { live: "https://", code: "https://github.com" },
            cta: "View Project",
            category: defaultCat,
            role: "Lead Full Stack Engineer",
            duration: "3 Months",
            client: "Global Client",
            status: "Completed",
            featured: true,
            features: [
                "Engineered responsive UI with Next.js and Tailwind CSS",
                "Built microservice architecture handling high concurrent load",
                "Automated zero-downtime deployment pipelines",
            ],
            tech: [
                { name: "React", category: "Frontend", iconUrl: null },
                { name: "Node.js", category: "Backend", iconUrl: null },
                { name: "PostgreSQL", category: "Database", iconUrl: null },
            ],
        };

        setActiveModalProject(newProject);
        setEditingIndex(null); // null means creating new
        setModalTab("basic");
        setNewImageUrl("");
    };

    const handleOpenEdit = (index: number) => {
        const proj = JSON.parse(JSON.stringify(projects[index]));
        let images = Array.isArray(proj.images) ? [...proj.images] : [];
        if (proj.image) {
            if (!images.includes(proj.image)) {
                images.unshift(proj.image);
            } else if (images[0] !== proj.image) {
                images = [proj.image, ...images.filter((img: string) => img !== proj.image)];
            }
        } else if (images.length > 0) {
            proj.image = images[0];
        } else {
            proj.image = "";
            images = [];
        }
        proj.images = images;
        proj.image = images[0] || proj.image || "";

        setActiveModalProject(proj);
        setEditingIndex(index);
        setModalTab("basic");
        setNewImageUrl("");
    };

    const handleSaveModal = async () => {
        if (!activeModalProject) return;
        if (!activeModalProject.title.trim()) {
            toast.error("Project title is required");
            return;
        }

        const projectToSave = { ...activeModalProject };
        const images = Array.isArray(projectToSave.images) && projectToSave.images.length > 0
            ? [...projectToSave.images]
            : projectToSave.image ? [projectToSave.image] : [];
        projectToSave.images = images;
        projectToSave.image = images[0] || projectToSave.image || "";

        const next = [...projects];
        if (editingIndex === null) {
            // Add new
            next.unshift(projectToSave);
        } else {
            // Update existing
            next[editingIndex] = projectToSave;
        }

        await persistProjects(next);
        setActiveModalProject(null);
        setEditingIndex(null);
    };

    const handleDeleteProject = async (index: number) => {
        const target = projects[index];
        if (!confirm(`Are you sure you want to delete project "${target.title}"?`)) return;
        const next = projects.filter((_, i) => i !== index);
        await persistProjects(next);
        toast.info(`Deleted project "${target.title}"`);

        // Delete all project images from Cloudinary
        const imagesToDelete = (target.images || []).filter((url) => url && url.includes("cloudinary.com"));
        if (target.image && target.image.includes("cloudinary.com") && !imagesToDelete.includes(target.image)) {
            imagesToDelete.push(target.image);
        }

        if (imagesToDelete.length > 0) {
            try {
                const res = await fetch("/api/upload", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ urls: imagesToDelete }),
                });
                if (res.ok) {
                    toast.success(`Deleted ${imagesToDelete.length} image(s) from Cloudinary`);
                }
            } catch (err) {
                console.error("Failed to delete project assets from Cloudinary:", err);
            }
        }
    };

    const handleDuplicateProject = (index: number) => {
        const target = projects[index];
        const copy: Project = JSON.parse(JSON.stringify(target));
        copy.id = String(projects.length + 1).padStart(2, "0");
        copy.slug = `${copy.slug}-copy-${Date.now().toString().slice(-3)}`;
        copy.title = `${copy.title} (Copy)`;

        const next = [...projects];
        next.splice(index + 1, 0, copy);
        persistProjects(next);
        toast.success("Project duplicated!");
    };

    const handleMove = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= projects.length) return;
        const next = [...projects];
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
        persistProjects(next);
    };

    // Upload image to Cloudinary inside modal
    const handleUploadImage = async (file: File) => {
        if (!activeModalProject) return;
        setIsUploading(true);
        const toastId = toast.loading("Uploading image to Cloudinary...");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const result = await res.json();
            if (res.ok && result.url) {
                const currentImgs = [...(activeModalProject.images || [])];
                const nextImgs = [...currentImgs, result.url];
                setActiveModalProject({
                    ...activeModalProject,
                    image: nextImgs[0] || result.url,
                    images: nextImgs,
                });
                toast.success("Image uploaded & added to gallery!", { id: toastId });
            } else {
                toast.error(result.error || "Failed to upload image", { id: toastId });
            }
        } catch {
            toast.error("Network error during image upload", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    // Add image from URL input
    const handleAddImageUrl = () => {
        if (!activeModalProject || !newImageUrl.trim()) return;
        const trimmed = newImageUrl.trim();
        const currentImgs = [...(activeModalProject.images || [])];
        const nextImgs = [...currentImgs, trimmed];
        setActiveModalProject({
            ...activeModalProject,
            image: nextImgs[0] || trimmed,
            images: nextImgs,
        });
        setNewImageUrl("");
        toast.success("Image added to gallery!");
    };

    // Promote any gallery image to 1st index (Cover Image)
    const handleSetCoverImage = (imgIdx: number) => {
        if (!activeModalProject || imgIdx === 0) return;
        const currentImgs = [...(activeModalProject.images || [])];
        const [chosen] = currentImgs.splice(imgIdx, 1);
        currentImgs.unshift(chosen);
        setActiveModalProject({
            ...activeModalProject,
            image: chosen,
            images: currentImgs,
        });
        toast.success("Image moved to #1 and set as primary cover!");
    };

    // Move image position in gallery (swapping indexes)
    const handleMoveGalleryImage = (fromIdx: number, toIdx: number) => {
        if (!activeModalProject) return;
        const currentImgs = [...(activeModalProject.images || [])];
        if (toIdx < 0 || toIdx >= currentImgs.length) return;
        const temp = currentImgs[fromIdx];
        currentImgs[fromIdx] = currentImgs[toIdx];
        currentImgs[toIdx] = temp;
        setActiveModalProject({
            ...activeModalProject,
            image: currentImgs[0] || "",
            images: currentImgs,
        });
    };

    // Edit an existing image URL in-place
    const handleEditGalleryImageUrl = (idx: number, val: string) => {
        if (!activeModalProject) return;
        const currentImgs = [...(activeModalProject.images || [])];
        currentImgs[idx] = val;
        setActiveModalProject({
            ...activeModalProject,
            image: currentImgs[0] || "",
            images: currentImgs,
        });
    };

    // Delete image from gallery & delete from Cloudinary
    const handleDeleteGalleryImage = async (imgIdx: number) => {
        if (!activeModalProject) return;
        const targetUrl = activeModalProject.images?.[imgIdx];
        const updated = (activeModalProject.images || []).filter((_, i) => i !== imgIdx);
        setActiveModalProject({
            ...activeModalProject,
            image: updated[0] || "",
            images: updated,
        });
        toast.info("Image removed from project");

        // Delete from Cloudinary if it is a Cloudinary asset
        if (targetUrl && targetUrl.includes("cloudinary.com")) {
            try {
                const res = await fetch("/api/upload", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ url: targetUrl }),
                });
                if (res.ok) {
                    toast.success("Image permanently removed from Cloudinary");
                }
            } catch (err) {
                console.error("Failed to delete image from Cloudinary:", err);
            }
        }
    };

    // Filter projects by category, search query, and status
    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            if (statusFilter === "featured" && p.featured !== true) return false;
            if (statusFilter === "unfeatured" && p.featured === true) return false;

            const matchesCat =
                selectedCategory === "all" ||
                p.category?.toLowerCase() === selectedCategory.toLowerCase();
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                p.title.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q) ||
                p.stack.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.id.includes(q);
            return matchesCat && matchesSearch;
        });
    }, [projects, statusFilter, selectedCategory, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedProjects = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredProjects.slice(start, start + pageSize);
    }, [filteredProjects, safeCurrentPage, pageSize]);

    const featuredCount = useMemo(() => projects.filter((p) => p.featured === true).length, [projects]);

    const inputClass =
        "w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all";
    const labelClass =
        "text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-7 h-7 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Loading Projects Module...
                </span>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Header & Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        Selected Works
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                            {projects.length} Total
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {featuredCount} in 3D Stack
                        </span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Manage relational projects, attached master tech stacks, case studies, and gallery assets.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Create Project
                    </button>
                </div>
            </div>

            {/* Filters & Search Row */}
            <div className="flex flex-col gap-3 bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search by title, stack, slug, or ID..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setCurrentPage(1);
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Filter Tabs */}
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-xs">
                            <button
                                onClick={() => {
                                    setStatusFilter("all");
                                    setCurrentPage(1);
                                }}
                                className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                                    statusFilter === "all" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                                }`}
                            >
                                All ({projects.length})
                            </button>
                            <button
                                onClick={() => {
                                    setStatusFilter("featured");
                                    setCurrentPage(1);
                                }}
                                className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${
                                    statusFilter === "featured" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                                }`}
                            >
                                <Star className="w-3 h-3 fill-current" />
                                3D Stack ({featuredCount})
                            </button>
                            <button
                                onClick={() => {
                                    setStatusFilter("unfeatured");
                                    setCurrentPage(1);
                                }}
                                className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                                    statusFilter === "unfeatured" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                                }`}
                            >
                                Catalog ({projects.length - featuredCount})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category Pills Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pt-1 border-t border-zinc-800/50">
                    <button
                        onClick={() => {
                            setSelectedCategory("all");
                            setCurrentPage(1);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                            selectedCategory === "all"
                                ? "bg-white text-black font-bold"
                                : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                        }`}
                    >
                        All Categories ({projects.length})
                    </button>
                    {categories.map((cat) => {
                        const count = projects.filter(
                            (p) => p.category?.toLowerCase() === cat.label.toLowerCase()
                        ).length;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.label);
                                    setCurrentPage(1);
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                                    selectedCategory === cat.label
                                        ? "bg-white text-black font-bold"
                                        : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                                }`}
                            >
                                {cat.label} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Projects Grid Display */}
            {filteredProjects.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col items-center justify-center gap-3">
                    <FolderKanban className="w-8 h-8 text-zinc-600" />
                    <h3 className="text-base font-bold uppercase tracking-wider text-zinc-400">
                        No Projects Match Query
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-sm">
                        Try modifying your search query or category filter, or click "Create Project" to add a new project.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("all");
                            setStatusFilter("all");
                            setCurrentPage(1);
                        }}
                        className="text-xs text-cyan-400 hover:underline font-mono"
                    >
                        Reset all filters
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5 w-full">
                        {paginatedProjects.map((p, index) => {
                            const globalIndex = projects.findIndex(
                                (item) => item.slug === p.slug || item.id === p.id
                            );

                            return (
                                <div
                                    key={p.slug || p.id || index}
                                    className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-700 transition-all shadow-sm group"
                                >
                                    {/* Top Meta Row */}
                                    <div>
                                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-bold bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded">
                                                    #{p.id}
                                                </span>
                                                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                                                    {p.category}
                                                </span>
                                                {p.featured && (
                                                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-amber-400" /> Featured
                                                    </span>
                                                )}
                                            </div>

                                            {/* Ordering Arrows */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleMove(globalIndex, "up")}
                                                    disabled={globalIndex === 0}
                                                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800"
                                                    title="Move Up"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleMove(globalIndex, "down")}
                                                    disabled={globalIndex === projects.length - 1}
                                                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800"
                                                    title="Move Down"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Cover Image & Title */}
                                        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-black border border-zinc-800 mb-3 group/img flex items-center justify-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={p.image}
                                                alt={p.title}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLElement).style.display = "none";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 pointer-events-none">
                                                <div className="text-white font-black text-sm uppercase tracking-tight truncate">
                                                    {p.title}
                                                </div>
                                            </div>
                                        </div>

                                        {p.tagline && (
                                            <p className="text-xs text-zinc-300 font-medium line-clamp-1 mb-2">
                                                {p.tagline}
                                            </p>
                                        )}

                                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                                            {p.description}
                                        </p>

                                        {/* Tech Pills */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {(p.tech || []).slice(0, 4).map((t, tIdx) => (
                                                <span
                                                    key={tIdx}
                                                    className="text-[10px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded"
                                                >
                                                    {t.name}
                                                </span>
                                            ))}
                                            {(p.tech || []).length > 4 && (
                                                <span className="text-[10px] font-mono text-zinc-500 px-1 py-0.5">
                                                    +{(p.tech || []).length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom Action Bar */}
                                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            {p.links?.live && (
                                                <a
                                                    href={p.links.live}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                    title="Open Live Preview"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDuplicateProject(globalIndex)}
                                                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                title="Duplicate Project"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(globalIndex)}
                                                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                                                title="Delete Project"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleOpenEdit(globalIndex)}
                                            className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" /> Edit Project
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-zinc-400 font-mono text-xs">
                                Showing{" "}
                                <strong className="text-white">
                                    {(safeCurrentPage - 1) * pageSize + 1}–
                                    {Math.min(safeCurrentPage * pageSize, filteredProjects.length)}
                                </strong>{" "}
                                of <strong className="text-white">{filteredProjects.length}</strong> projects
                            </span>

                            {/* Per-Page Limit Selector at Bottom */}
                            <div className="flex items-center gap-2 pl-3 border-l border-zinc-800">
                                <span className="text-[11px] font-mono text-zinc-500 uppercase">Per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-zinc-500 cursor-pointer"
                                >
                                    <option value={6}>6</option>
                                    <option value={12}>12</option>
                                    <option value={24}>24</option>
                                    <option value={projects.length || 100}>All ({projects.length})</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safeCurrentPage <= 1}
                                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 flex items-center gap-1.5 transition-colors"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Previous</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                                    <button
                                        key={pg}
                                        onClick={() => setCurrentPage(pg)}
                                        className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-colors ${
                                            pg === safeCurrentPage
                                                ? "bg-white text-black"
                                                : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
                                        }`}
                                    >
                                        {pg}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safeCurrentPage >= totalPages}
                                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 flex items-center gap-1.5 transition-colors"
                            >
                                <span>Next</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* DEDICATED PROJECT EDITOR MODAL (Clean, Step-by-Step, Non-Overwhelming) */}
            {/* ========================================================================= */}
            {activeModalProject && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                    <div className="bg-[#0e0e11] border border-zinc-800 rounded-2xl w-full max-w-4xl h-[88vh] max-h-[820px] min-h-[580px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 shrink-0">
                            <div>
                                <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">
                                    {editingIndex === null ? "New Project Workflow" : `Editing #${activeModalProject.id}`}
                                </span>
                                <h2 className="text-lg font-black uppercase text-white truncate max-w-lg">
                                    {activeModalProject.title || "Untitled Project"}
                                </h2>
                            </div>

                            <button
                                onClick={() => setActiveModalProject(null)}
                                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Sub-Tabs Navigation */}
                        <div className="px-6 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center gap-2 overflow-x-auto shrink-0">
                            <button
                                onClick={() => setModalTab("basic")}
                                className={`py-3 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all shrink-0 ${
                                    modalTab === "basic"
                                        ? "border-white text-white"
                                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                                <Tag className="w-3.5 h-3.5" />
                                <span>General Info</span>
                            </button>
                            <button
                                onClick={() => setModalTab("tech")}
                                className={`py-3 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all shrink-0 ${
                                    modalTab === "tech"
                                        ? "border-white text-white"
                                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                                <Cpu className="w-3.5 h-3.5" />
                                <span>Tech Stack ({activeModalProject.tech?.length || 0})</span>
                            </button>
                            <button
                                onClick={() => setModalTab("media")}
                                className={`py-3 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all shrink-0 ${
                                    modalTab === "media"
                                        ? "border-white text-white"
                                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Media & Gallery</span>
                            </button>
                            <button
                                onClick={() => setModalTab("description")}
                                className={`py-3 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all shrink-0 ${
                                    modalTab === "description"
                                        ? "border-white text-white"
                                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Case Study Text</span>
                            </button>
                            <button
                                onClick={() => setModalTab("features")}
                                className={`py-3 px-3.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all shrink-0 ${
                                    modalTab === "features"
                                        ? "border-white text-white"
                                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                                <ListChecks className="w-3.5 h-3.5" />
                                <span>Deliverables ({activeModalProject.features?.length || 0})</span>
                            </button>
                        </div>

                        {/* Modal Tab Body (consistent scrollable area across all sub-tabs) */}
                        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 min-h-0">
                            {/* TAB 1: BASIC INFO */}
                            {modalTab === "basic" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Project Title</label>
                                        <input
                                            className={inputClass + " font-bold text-base"}
                                            value={activeModalProject.title}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    title: e.target.value,
                                                })
                                            }
                                            placeholder="Platform / Application Name"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>URL Slug (Unique)</label>
                                        <input
                                            className={inputClass + " font-mono text-xs"}
                                            value={activeModalProject.slug}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    slug: e.target.value,
                                                })
                                            }
                                            placeholder="project-slug"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            <span>Database Category</span>
                                            <span className="text-[9px] text-zinc-500">Relational</span>
                                        </label>
                                        <select
                                            className={inputClass + " text-xs"}
                                            value={activeModalProject.category}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    category: e.target.value,
                                                })
                                            }
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
                                            value={activeModalProject.tagline || ""}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    tagline: e.target.value,
                                                })
                                            }
                                            placeholder="Next-generation scalable full-stack platform..."
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Project Status</label>
                                        <select
                                            className={inputClass + " text-xs"}
                                            value={activeModalProject.status || "Completed"}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    status: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="Completed">Completed</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Engineering Role</label>
                                        <input
                                            className={inputClass + " text-xs"}
                                            value={activeModalProject.role || ""}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    role: e.target.value,
                                                })
                                            }
                                            placeholder="Full Stack Lead"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Project Duration</label>
                                        <input
                                            className={inputClass + " text-xs"}
                                            value={activeModalProject.duration || ""}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    duration: e.target.value,
                                                })
                                            }
                                            placeholder="3 Months"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Client Name</label>
                                        <input
                                            className={inputClass + " text-xs"}
                                            value={activeModalProject.client || ""}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    client: e.target.value,
                                                })
                                            }
                                            placeholder="Global Brand / Client"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Live Demo URL</label>
                                        <input
                                            className={inputClass + " font-mono text-xs"}
                                            value={activeModalProject.links?.live || ""}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    links: {
                                                        ...activeModalProject.links,
                                                        live: e.target.value,
                                                    },
                                                })
                                            }
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Source Code URL</label>
                                        <input
                                            className={inputClass + " font-mono text-xs"}
                                            value={activeModalProject.links?.code || ""}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    links: {
                                                        ...activeModalProject.links,
                                                        code: e.target.value,
                                                    },
                                                })
                                            }
                                            placeholder="https://github.com/..."
                                        />
                                    </div>

                                    <div className="sm:col-span-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-200">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(activeModalProject.featured)}
                                                onChange={(e) =>
                                                    setActiveModalProject({
                                                        ...activeModalProject,
                                                        featured: e.target.checked,
                                                    })
                                                }
                                                className="rounded border-zinc-700 bg-zinc-800 text-white"
                                            />
                                            <span className="font-semibold">
                                                Feature on Home Page 3D Scroll Stack
                                            </span>
                                        </label>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-zinc-500 uppercase font-mono">
                                                CTA:
                                            </span>
                                            <input
                                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-200 w-28 focus:outline-none"
                                                value={activeModalProject.cta || "View Project"}
                                                onChange={(e) =>
                                                    setActiveModalProject({
                                                        ...activeModalProject,
                                                        cta: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: TECH STACK SELECTOR (Directly from DB) */}
                            {modalTab === "tech" && (
                                <div className="flex flex-col gap-5">
                                    <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono mb-2 block">
                                            Currently Selected Tech Stacks ({activeModalProject.tech?.length || 0})
                                        </label>
                                        <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                                            {(activeModalProject.tech || []).length === 0 ? (
                                                <span className="text-xs text-zinc-500 italic">
                                                    No technologies selected yet. Click any chip below to attach from the DB registry.
                                                </span>
                                            ) : (
                                                (activeModalProject.tech || []).map((t, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-100"
                                                    >
                                                        <span>{t.name}</span>
                                                        <span className="text-[9px] font-mono text-zinc-400 uppercase bg-zinc-800 px-1 rounded">
                                                            {t.category}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = activeModalProject.tech.filter(
                                                                    (item) =>
                                                                        item.name.toLowerCase() !==
                                                                        t.name.toLowerCase()
                                                                );
                                                                setActiveModalProject({
                                                                    ...activeModalProject,
                                                                    tech: updated,
                                                                    stack: updated
                                                                        .map((item) => item.name)
                                                                        .join(" / "),
                                                                });
                                                            }}
                                                            className="text-zinc-500 hover:text-rose-400"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Pick from Master Tech Stacks */}
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono mb-3 block">
                                            Click to Add from Database Registry ({masterTechs.length})
                                        </label>
                                        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
                                            {masterTechs.map((mt) => {
                                                const isAttached = (
                                                    activeModalProject.tech || []
                                                ).some(
                                                    (t) =>
                                                        t.name.toLowerCase() === mt.name.toLowerCase()
                                                );

                                                return (
                                                    <button
                                                        key={mt.id}
                                                        type="button"
                                                        disabled={isAttached}
                                                        onClick={() => {
                                                            const updated = [
                                                                ...(activeModalProject.tech || []),
                                                                {
                                                                    name: mt.name,
                                                                    category: mt.role,
                                                                    iconUrl: mt.iconUrl,
                                                                },
                                                            ];
                                                            setActiveModalProject({
                                                                ...activeModalProject,
                                                                tech: updated,
                                                                stack: updated
                                                                    .map((item) => item.name)
                                                                    .join(" / "),
                                                            });
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                                                            isAttached
                                                                ? "bg-zinc-800/40 border-zinc-800 text-zinc-600 cursor-not-allowed"
                                                                : "bg-zinc-900 border-zinc-700/80 text-zinc-300 hover:border-zinc-500 hover:text-white"
                                                        }`}
                                                    >
                                                        <span>{mt.name}</span>
                                                        <span className="text-[9px] font-mono text-zinc-500 uppercase">
                                                            {mt.role}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: MEDIA & GALLERY */}
                            {modalTab === "media" && (
                                <div className="flex flex-col gap-4">
                                    {/* Sleek Top Control Bar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4 text-cyan-400" />
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                                                    Gallery Assets ({(activeModalProject.images || []).length})
                                                </h3>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/25 flex items-center gap-1">
                                                <Star className="w-2.5 h-2.5 fill-current" /> #1 is Cover
                                            </span>
                                        </div>

                                        {/* Actions: Add URL & Upload File */}
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <input
                                                    type="url"
                                                    value={newImageUrl}
                                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            handleAddImageUrl();
                                                        }
                                                    }}
                                                    placeholder="Paste Image URL..."
                                                    className="w-48 sm:w-64 bg-zinc-900 border border-zinc-800 rounded-lg pl-3 pr-14 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 font-mono focus:outline-none focus:border-zinc-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddImageUrl}
                                                    disabled={!newImageUrl.trim()}
                                                    className="absolute right-1 top-1 bottom-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-white rounded text-[11px] font-bold transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleUploadImage(file);
                                                }}
                                            />

                                            <button
                                                type="button"
                                                disabled={isUploading}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-sm disabled:opacity-50"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                <span>{isUploading ? "Uploading..." : "Upload"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Clean Visual Gallery Grid */}
                                    {(activeModalProject.images || []).length === 0 ? (
                                        <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/30 flex flex-col items-center justify-center gap-2 text-zinc-500">
                                            <ImageIcon className="w-8 h-8 text-zinc-700" />
                                            <p className="text-xs font-mono uppercase tracking-wider">
                                                No project images added yet
                                            </p>
                                            <p className="text-[11px] text-zinc-600 max-w-sm">
                                                Paste an image URL above or click Upload to attach project screenshots. The first image will automatically serve as the primary cover.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {(activeModalProject.images || []).map((imgUrl, imgIdx) => {
                                                const isCover = imgIdx === 0;

                                                return (
                                                    <div
                                                        key={imgIdx}
                                                        className={`group relative rounded-xl border overflow-hidden bg-zinc-950 flex flex-col transition-all ${
                                                            isCover
                                                                ? "border-amber-400 ring-2 ring-amber-400/25 shadow-[0_0_20px_rgba(251,191,36,0.12)]"
                                                                : "border-zinc-800 hover:border-zinc-700"
                                                        }`}
                                                    >
                                                        {/* Image Stage Preview (fully shows whole image) */}
                                                        <div className="relative aspect-[4/3] w-full bg-black flex items-center justify-center border-b border-zinc-800/80 overflow-hidden">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={imgUrl}
                                                                alt={`Asset ${imgIdx + 1}`}
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => {
                                                                    (e.target as HTMLElement).style.display = "none";
                                                                }}
                                                            />

                                                            {/* Floating Overlay Controls on Top */}
                                                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                                                                {isCover ? (
                                                                    <span className="pointer-events-auto px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                                                                        <Star className="w-2.5 h-2.5 fill-current" /> Cover (#1)
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSetCoverImage(imgIdx)}
                                                                        className="pointer-events-auto px-2 py-0.5 rounded-full bg-black/80 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-400/40 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all backdrop-blur-md opacity-90 group-hover:opacity-100 shadow"
                                                                        title="Make this image the primary cover"
                                                                    >
                                                                        <Star className="w-2.5 h-2.5 fill-current" />
                                                                        <span>Set as Cover</span>
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteGalleryImage(imgIdx)}
                                                                    className="pointer-events-auto p-1 bg-black/80 hover:bg-rose-500 text-zinc-400 hover:text-white rounded-md transition-colors backdrop-blur-md shadow"
                                                                    title="Remove image"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Sleek Bottom Bar: Index + Inline URL + Reorder Buttons */}
                                                        <div className="px-2.5 py-1.5 bg-zinc-900/90 flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 shrink-0">
                                                                    #{imgIdx + 1}
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={imgUrl}
                                                                    onChange={(e) => handleEditGalleryImageUrl(imgIdx, e.target.value)}
                                                                    className="w-full bg-transparent text-[11px] font-mono text-zinc-400 hover:text-zinc-200 focus:text-white focus:bg-zinc-950 focus:px-1.5 focus:py-0.5 focus:rounded focus:outline-none focus:ring-1 focus:ring-zinc-600 truncate transition-all"
                                                                    title="Click to edit URL directly"
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-0.5 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    disabled={imgIdx === 0}
                                                                    onClick={() => handleMoveGalleryImage(imgIdx, imgIdx - 1)}
                                                                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                                                                    title="Move earlier (towards cover)"
                                                                >
                                                                    <ChevronLeft className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={imgIdx === (activeModalProject.images || []).length - 1}
                                                                    onClick={() => handleMoveGalleryImage(imgIdx, imgIdx + 1)}
                                                                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
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

                            {/* TAB 4: CASE STUDY DESCRIPTIONS */}
                            {modalTab === "description" && (
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className={labelClass}>
                                            <span>Short Card Summary</span>
                                            <span className="text-[9px] text-zinc-500">
                                                Displayed on project cards & grid
                                            </span>
                                        </label>
                                        <textarea
                                            className={inputClass + " resize-y min-h-[90px] leading-relaxed"}
                                            rows={3}
                                            value={activeModalProject.description}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Clear, punchy project overview..."
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            <span>Full Case Study (Details View)</span>
                                            <span className="text-[9px] text-zinc-500">
                                                Rendered on /projects/[slug]
                                            </span>
                                        </label>
                                        <textarea
                                            className={inputClass + " resize-y min-h-[160px] leading-relaxed font-mono text-xs"}
                                            rows={8}
                                            value={activeModalProject.longDescription || ""}
                                            onChange={(e) =>
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    longDescription: e.target.value,
                                                })
                                            }
                                            placeholder="Comprehensive case study covering problem statement, system architecture, database design, and key engineering solutions..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 5: KEY DELIVERABLES / FEATURES */}
                            {modalTab === "features" && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                                            Feature Bullet Highlights ({(activeModalProject.features || []).length})
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveModalProject({
                                                    ...activeModalProject,
                                                    features: [
                                                        ...(activeModalProject.features || []),
                                                        "New technical deliverable or optimization highlight",
                                                    ],
                                                });
                                            }}
                                            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> Add Feature
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2.5">
                                        {(activeModalProject.features || []).map((feat, fIdx) => (
                                            <div key={fIdx} className="flex items-center gap-2">
                                                <span className="text-zinc-600 font-mono text-xs">•</span>
                                                <input
                                                    className={inputClass + " py-2 text-xs"}
                                                    value={feat}
                                                    onChange={(e) => {
                                                        const updated = [...activeModalProject.features];
                                                        updated[fIdx] = e.target.value;
                                                        setActiveModalProject({
                                                            ...activeModalProject,
                                                            features: updated,
                                                        });
                                                    }}
                                                    placeholder="Engineering accomplishment..."
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = activeModalProject.features.filter(
                                                            (_, i) => i !== fIdx
                                                        );
                                                        setActiveModalProject({
                                                            ...activeModalProject,
                                                            features: updated,
                                                        });
                                                    }}
                                                    className="p-1.5 text-zinc-500 hover:text-rose-400 rounded"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveModalProject(null)}
                                className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={handleSaveModal}
                                className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        <span>Saving to DB...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Save & Commit Project</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
