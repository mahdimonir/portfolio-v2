"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ProjectsCatalogSkeleton } from "@/components/dashboard/DashboardSkeletons";
import { optimizeImageUrl } from "@/lib/image-utils";
import {
    FolderKanban,
    Plus,
    Search,
    Edit3,
    Trash2,
    Copy,
    ArrowUp,
    ArrowDown,
    ExternalLink,
    Star,
    Layers,
    X,
    ChevronLeft,
    ChevronRight,
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
    links: {
        live?: string | null;
        code?: string | null;
        api?: string | null;
        play_store?: string | null;
        app_store?: string | null;
    };
    cta: string;
    category: string;
    role?: string | null;
    duration?: string | null;
    client?: string | null;
    status?: string | null;
    featured?: boolean;
    features: string[];
    tech: ProjectTech[];
    variants?: ProjectVariantItem[];
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

export default function ProjectsDashboardPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "featured" | "unfeatured">("all");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(6);

    // 1. Load initial data
    const loadData = useCallback(async () => {
        try {
            const [portRes, catRes] = await Promise.all([
                fetch("/api/portfolio?scope=projects").catch(() => null),
                fetch("/api/categories").catch(() => null),
            ]);

            const portData = portRes && portRes.ok ? await portRes.json().catch(() => []) : [];
            const catData = catRes && catRes.ok ? await catRes.json().catch(() => []) : [];

            if (Array.isArray(catData)) setCategories(catData);

            const projectList = Array.isArray(portData)
                ? portData
                : Array.isArray(portData?.projects)
                ? portData.projects
                : [];

            if (projectList.length > 0) {
                setProjects(
                    projectList.map((p: Project) => ({
                        ...p,
                        images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
                        features: Array.isArray(p.features) ? p.features : [],
                        tech: Array.isArray(p.tech) ? p.tech : [],
                        variants: Array.isArray(p.variants) ? p.variants : [],
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

    const handleDeleteProject = async (index: number) => {
        const target = projects[index];
        if (!confirm(`Are you sure you want to delete project "${target.title}"?`)) return;

        // Granular DELETE /api/projects/[slug]
        try {
            const res = await fetch(`/api/projects/${encodeURIComponent(target.slug)}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                const next = projects.filter((_, i) => i !== index);
                setProjects(next);
                router.refresh();
                toast.info(`Deleted project "${target.title}"`);
            } else {
                toast.error("Failed to delete project");
                return;
            }
        } catch {
            toast.error("Network error deleting project");
            return;
        }

        // Delete project images from Cloudinary if applicable
        const imagesToDelete = (target.images || []).filter((url) => url && url.includes("cloudinary.com"));
        if (target.image && target.image.includes("cloudinary.com") && !imagesToDelete.includes(target.image)) {
            imagesToDelete.push(target.image);
        }

        if (imagesToDelete.length > 0) {
            try {
                await fetch("/api/upload", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ urls: imagesToDelete }),
                });
            } catch (err) {
                console.error("Failed to delete project assets from Cloudinary:", err);
            }
        }
    };

    const handleDuplicateProject = async (index: number) => {
        const target = projects[index];
        const copy: Project = JSON.parse(JSON.stringify(target));
        copy.slug = `${copy.slug}-copy-${Date.now().toString().slice(-4)}`;
        copy.title = `${copy.title} (Copy)`;

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(copy),
            });
            if (res.ok) {
                toast.success("Project duplicated!");
                loadData();
            } else {
                toast.error("Failed to duplicate project");
            }
        } catch {
            toast.error("Network error duplicating project");
        }
    };

    // Fast transaction reordering via POST /api/projects/reorder
    const handleMove = async (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= projects.length) return;
        const next = [...projects];
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
        setProjects(next);

        const orderList = next.map((p, idx) => ({
            slug: p.slug,
            order: idx,
            featured: Boolean(p.featured),
        }));

        try {
            const res = await fetch("/api/projects/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ orderList }),
            });
            if (res.ok) {
                toast.success("Project order saved!");
            } else {
                toast.error("Failed to save reorder");
                loadData();
            }
        } catch {
            toast.error("Network error while reordering");
            loadData();
        }
    };

    // Filter projects by category, search query, and status
    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            if (statusFilter === "featured" && p.featured !== true) return false;
            if (statusFilter === "unfeatured" && p.featured === true) return false;

            const matchesCat =
                selectedCategory === "all" ||
                (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

            if (!matchesCat) return false;

            if (!searchQuery.trim()) return true;

            const q = searchQuery.toLowerCase().trim();
            const inTitle = p.title?.toLowerCase().includes(q);
            const inDesc = p.description?.toLowerCase().includes(q);
            const inStack = p.stack?.toLowerCase().includes(q);
            const inSlug = p.slug?.toLowerCase().includes(q);
            const inId = p.id?.toLowerCase().includes(q);
            const inTech = Array.isArray(p.tech) && p.tech.some((t) => t.name?.toLowerCase().includes(q));

            return inTitle || inDesc || inStack || inSlug || inId || inTech;
        });
    }, [projects, selectedCategory, searchQuery, statusFilter]);

    // Paginated list
    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedProjects = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredProjects.slice(start, start + pageSize);
    }, [filteredProjects, safeCurrentPage, pageSize]);

    const featuredCount = useMemo(() => {
        return projects.filter((p) => p.featured === true).length;
    }, [projects]);

    if (loading) {
        return <ProjectsCatalogSkeleton />;
    }

    return (
        <div className="w-full flex flex-col gap-8 pb-12">
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
                        Manage projects, platform editions, case studies, and gallery screenshots.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href="/dashboard/projects/new"
                        className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Create Project
                    </Link>
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
                            const position = globalIndex !== -1 ? globalIndex + 1 : (currentPage - 1) * pageSize + index + 1;

                            return (
                                <div
                                    key={p.slug || p.id || index}
                                    className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-700 transition-all shadow-sm group"
                                >
                                    {/* Top Meta Row */}
                                    <div>
                                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80">
                                                    #{String(position).padStart(2, "0")}
                                                </span>
                                                <span className="font-mono text-xs text-zinc-400">/{p.slug}</span>
                                                {p.featured && (
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/25 flex items-center gap-1">
                                                        <Star className="w-2.5 h-2.5 fill-current" /> 3D Stack
                                                    </span>
                                                )}
                                                {p.variants && p.variants.length > 1 && (
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/25 flex items-center gap-1">
                                                        <Layers className="w-2.5 h-2.5" /> {p.variants.length} Editions
                                                    </span>
                                                )}
                                            </div>

                                            {/* Reorder Buttons */}
                                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleMove(globalIndex, "up")}
                                                    disabled={globalIndex === 0}
                                                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 hover:bg-zinc-800 rounded transition-colors"
                                                    title="Move Up in sequence"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleMove(globalIndex, "down")}
                                                    disabled={globalIndex === projects.length - 1}
                                                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 hover:bg-zinc-800 rounded transition-colors"
                                                    title="Move Down in sequence"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Project Image Stage Preview */}
                                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-zinc-800/80 mb-3 group/img">
                                            {p.image ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={optimizeImageUrl(p.image, { width: 600, quality: "auto" })}
                                                    alt={p.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/img:scale-105"
                                                    onError={(e) => {
                                                        (e.target as HTMLElement).style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-1">
                                                    <FolderKanban className="w-6 h-6" />
                                                    <span className="text-[10px] font-mono uppercase">No Cover Image</span>
                                                </div>
                                            )}

                                            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-zinc-300 border border-white/10">
                                                    {p.category}
                                                </span>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-zinc-400 border border-white/10">
                                                    {(p.images || []).length} Media
                                                </span>
                                            </div>
                                        </div>

                                        {/* Project Title & Tagline */}
                                        <h3 className="text-base font-black uppercase text-white tracking-tight mb-1 group-hover:text-cyan-400 transition-colors">
                                            {p.title}
                                        </h3>

                                        {p.tagline && (
                                            <p className="text-xs text-zinc-400 italic mb-2 line-clamp-1">
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

                                        <Link
                                            href={`/dashboard/projects/${p.slug}`}
                                            className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" /> Edit Project
                                        </Link>
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
        </div>
    );
}
