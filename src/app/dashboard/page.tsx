"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
    FolderKanban,
    Cpu,
    MessageSquare,
    ArrowUpRight,
    Plus,
    Calendar,
    Mail,
    Star,
    ExternalLink,
    Check,
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    CheckCheck,
    X,
} from "lucide-react";

interface Project {
    id: string;
    slug: string;
    title: string;
    tagline?: string | null;
    category: string;
    stack: string;
    image: string;
    featured?: boolean;
    description?: string;
}

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject?: string | null;
    message: string;
    read: boolean;
    createdAt?: string;
    created_at?: string;
}

interface PortfolioData {
    name: string;
    firstName: string;
    title: string;
    role: string;
    location: string;
    availability: string;
    responseTime: string;
    hero: {
        headline: string;
        headlineSecond: string;
        subheadline: string;
        availability: string;
    };
    about: {
        experience: Array<unknown>;
        education: Array<unknown>;
        courses: Array<unknown>;
    };
    projects: Project[];
}

export default function DashboardOverviewPage() {
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
    const [techCount, setTechCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [togglingSlug, setTogglingSlug] = useState<string | null>(null);

    // Project filters & pagination state
    const [projectFilter, setProjectFilter] = useState<"all" | "featured" | "unfeatured">("all");
    const [projectSearch, setProjectSearch] = useState<string>("");
    const [projectCategory, setProjectCategory] = useState<string>("all");
    const [projectPage, setProjectPage] = useState<number>(1);
    const [projectLimit, setProjectLimit] = useState<number>(5);

    // Inquiries filter & mini-carousel pagination state
    const [inquiryFilter, setInquiryFilter] = useState<"all" | "unread">("all");
    const [inquiryPage, setInquiryPage] = useState<number>(1);
    const inquiryLimit = 3;

    // Load initial data
    const loadOverviewData = useCallback(async () => {
        try {
            const [portRes, contactRes, techRes] = await Promise.all([
                fetch("/api/portfolio"),
                fetch("/api/contact", { credentials: "include" }),
                fetch("/api/tech-stacks"),
            ]);

            const portData = await portRes.json();
            const contactData = await contactRes.json();
            const techData = await techRes.json();

            if (portData?.name) setPortfolio(portData);
            if (Array.isArray(contactData)) setInquiries(contactData);
            if (Array.isArray(techData)) setTechCount(techData.length);
        } catch (err) {
            console.error("Failed to load overview data:", err);
            toast.error("Failed to load studio overview");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOverviewData();
    }, [loadOverviewData]);

    const allProjects = useMemo(() => portfolio?.projects || [], [portfolio]);

    // Unique project categories for filter dropdown
    const projectCategories = useMemo(() => {
        const set = new Set<string>();
        allProjects.forEach((p) => {
            if (p.category) set.add(p.category);
        });
        return ["all", ...Array.from(set)];
    }, [allProjects]);

    // Strictly projects with featured === true
    const featuredProjects = useMemo(
        () => allProjects.filter((p) => p.featured === true),
        [allProjects]
    );

    const nonFeaturedProjects = useMemo(
        () => allProjects.filter((p) => p.featured !== true),
        [allProjects]
    );

    const unreadInquiries = useMemo(
        () => inquiries.filter((m) => !m.read),
        [inquiries]
    );

    // Filter projects by status, category, and keyword
    const filteredProjects = useMemo(() => {
        return allProjects.filter((p) => {
            if (projectFilter === "featured" && p.featured !== true) return false;
            if (projectFilter === "unfeatured" && p.featured === true) return false;

            if (
                projectCategory !== "all" &&
                p.category?.toLowerCase() !== projectCategory.toLowerCase()
            ) {
                return false;
            }

            const q = projectSearch.toLowerCase().trim();
            if (!q) return true;

            return (
                p.title.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.stack.toLowerCase().includes(q) ||
                (p.tagline && p.tagline.toLowerCase().includes(q)) ||
                p.id.includes(q)
            );
        });
    }, [allProjects, projectFilter, projectCategory, projectSearch]);

    // Calculate project pagination
    const totalProjectPages = Math.max(1, Math.ceil(filteredProjects.length / projectLimit));
    const safeProjectPage = Math.min(projectPage, totalProjectPages);
    const paginatedProjects = useMemo(() => {
        const start = (safeProjectPage - 1) * projectLimit;
        return filteredProjects.slice(start, start + projectLimit);
    }, [filteredProjects, safeProjectPage, projectLimit]);

    // Inquiries filtering & mini-pagination
    const filteredInquiries = useMemo(() => {
        if (inquiryFilter === "unread") return unreadInquiries;
        return inquiries;
    }, [inquiryFilter, unreadInquiries, inquiries]);

    const totalInquiryPages = Math.max(1, Math.ceil(filteredInquiries.length / inquiryLimit));
    const safeInquiryPage = Math.min(inquiryPage, totalInquiryPages);
    const paginatedInquiries = useMemo(() => {
        const start = (safeInquiryPage - 1) * inquiryLimit;
        return filteredInquiries.slice(start, start + inquiryLimit);
    }, [filteredInquiries, safeInquiryPage, inquiryLimit]);

    // Optimized fast project feature toggle using granular PUT /api/projects/[slug]
    const handleToggleFeatured = async (projectSlug: string, currentFeatured: boolean) => {
        setTogglingSlug(projectSlug);
        const newFeatured = !currentFeatured;

        // 1. Optimistic UI update
        if (portfolio) {
            setPortfolio({
                ...portfolio,
                projects: allProjects.map((p) =>
                    p.slug === projectSlug ? { ...p, featured: newFeatured } : p
                ),
            });
        }

        // 2. Fast granular API call
        try {
            const res = await fetch(`/api/projects/${encodeURIComponent(projectSlug)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ featured: newFeatured }),
            });

            if (res.ok) {
                toast.success(
                    newFeatured
                        ? "Added to Home Page 3D Stack!"
                        : "Removed from Home Page 3D Stack."
                );
            } else {
                toast.error("Failed to update status");
                loadOverviewData();
            }
        } catch {
            toast.error("Network error while updating");
            loadOverviewData();
        } finally {
            setTogglingSlug(null);
        }
    };

    // Fast toggle availability
    const handleToggleAvailability = async () => {
        if (!portfolio) return;
        const isAvailable =
            portfolio.availability.toLowerCase().includes("available") ||
            portfolio.hero.availability.toLowerCase().includes("available");

        const newAvail = isAvailable
            ? "Currently booked for client contracts"
            : "Available for freelance & contract work";
        const newBadge = isAvailable ? "BOOKED / BUSY" : "AVAILABLE FOR WORK";

        const updated = {
            ...portfolio,
            availability: newAvail,
            hero: { ...portfolio.hero, availability: newBadge },
        };

        setPortfolio(updated);

        try {
            await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updated),
            });
            toast.success(`Availability updated: "${newBadge}"`);
        } catch {
            toast.error("Failed to update availability");
            loadOverviewData();
        }
    };

    // Fast toggle inquiry read state
    const handleToggleMessageRead = async (msg: ContactMessage) => {
        const newRead = !msg.read;
        setInquiries((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, read: newRead } : m))
        );

        try {
            await fetch("/api/contact", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id: msg.id, read: newRead }),
            });
            toast.success(newRead ? "Marked as read" : "Marked as unread");
        } catch {
            toast.error("Failed to update message status");
            loadOverviewData();
        }
    };

    // Batch mark all inquiries as read
    const handleMarkAllInquiriesRead = async () => {
        if (unreadInquiries.length === 0) return;
        setInquiries((prev) => prev.map((m) => ({ ...m, read: true })));

        try {
            const res = await fetch("/api/contact", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ allRead: true }),
            });

            if (res.ok) {
                toast.success("All unread inquiries marked as read!");
            } else {
                toast.error("Failed to mark all as read");
                loadOverviewData();
            }
        } catch {
            toast.error("Network error updating messages");
            loadOverviewData();
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-7 h-7 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Loading Studio Overview...
                </span>
            </div>
        );
    }

    const isAvailableNow =
        portfolio?.hero?.availability?.toLowerCase().includes("available") ||
        portfolio?.availability?.toLowerCase().includes("available");

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Top Identity Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-black border border-zinc-800 flex items-center justify-center font-black text-lg text-white font-mono shrink-0 shadow-inner">
                        {portfolio?.firstName?.slice(0, 2) || "MD"}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                                {portfolio?.name || "Developer Studio"}
                            </h1>
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 rounded">
                                {portfolio?.role || "Full Stack"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-zinc-400 mt-0.5 font-mono">
                            <span>{portfolio?.location || "Bangladesh"}</span>
                            <span>•</span>
                            <span className="text-zinc-500">{portfolio?.responseTime || "24h reply"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Live Availability Toggle Switch */}
                    <button
                        onClick={handleToggleAvailability}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                            isAvailableNow
                                ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-400 hover:bg-emerald-900/50"
                                : "bg-amber-950/60 border-amber-800/80 text-amber-400 hover:bg-amber-900/50"
                        }`}
                        title="Click to toggle availability on live site"
                    >
                        <span className="relative flex h-2 w-2">
                            <span
                                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                    isAvailableNow ? "bg-emerald-400" : "bg-amber-400"
                                }`}
                            />
                            <span
                                className={`relative inline-flex rounded-full h-2 w-2 ${
                                    isAvailableNow ? "bg-emerald-400" : "bg-amber-400"
                                }`}
                            />
                        </span>
                        <span>{portfolio?.hero?.availability || "AVAILABLE FOR WORK"}</span>
                    </button>

                    <Link
                        href="/dashboard/projects"
                        className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" /> Project
                    </Link>
                </div>
            </div>

            {/* 4 Clean Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
                {/* 1. Featured on Home Page Card */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            Home 3D Stack
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                            {allProjects.length > 0
                                ? Math.round((featuredProjects.length / allProjects.length) * 100)
                                : 0}
                            %
                        </span>
                    </div>

                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-white">{featuredProjects.length}</span>
                            <span className="text-xs text-zinc-500 font-mono">/ {allProjects.length} Works</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2 mb-1">
                            <div
                                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${
                                        allProjects.length > 0
                                            ? (featuredProjects.length / allProjects.length) * 100
                                            : 0
                                    }%`,
                                }}
                            />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">featured = true only</span>
                    </div>
                </div>

                {/* 2. Total Catalog Projects */}
                <Link
                    href="/dashboard/projects"
                    className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-700 transition-all flex flex-col justify-between group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                            <FolderKanban className="w-3 h-3" />
                            Total Catalog
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>

                    <div>
                        <div className="text-2xl font-black text-white">{allProjects.length}</div>
                        <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                            Full Stack & Platforms
                        </span>
                    </div>
                </Link>

                {/* 3. Master Tech Registry */}
                <Link
                    href="/dashboard/skills"
                    className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-700 transition-all flex flex-col justify-between group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                            <Cpu className="w-3 h-3" />
                            Tech Stacks
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>

                    <div>
                        <div className="text-2xl font-black text-white">{techCount}</div>
                        <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                            Database Master Items
                        </span>
                    </div>
                </Link>

                {/* 4. Client Inquiries */}
                <Link
                    href="/dashboard/inquiries"
                    className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-700 transition-all flex flex-col justify-between group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3" />
                            Client Inquiries
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-white">{inquiries.length}</span>
                            {unreadInquiries.length > 0 && (
                                <span className="text-[9px] font-mono font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded">
                                    {unreadInquiries.length} NEW
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                            Inbound Contact Form
                        </span>
                    </div>
                </Link>
            </div>

            {/* Main Content Grid: 8 Cols (Featured Projects Manager) & 4 Cols (Inquiries & Status) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
                {/* Left (8 cols): Interactive Home Page 3D Stack Manager */}
                <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                    {/* Header & Status Filter Tabs */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                                    Home Page 3D Stack Controller
                                </h2>
                                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded">
                                    {featuredProjects.length} Active
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                                Toggle projects on/off instantly. Only projects with <code className="text-amber-300 font-mono text-[11px]">featured: true</code> render in the live 3D scroll stack.
                            </p>
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-[11px] self-start sm:self-auto shrink-0">
                            <button
                                onClick={() => {
                                    setProjectFilter("all");
                                    setProjectPage(1);
                                }}
                                className={`px-2.5 py-1 rounded font-bold uppercase transition-colors ${
                                    projectFilter === "all" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                                }`}
                            >
                                All ({allProjects.length})
                            </button>
                            <button
                                onClick={() => {
                                    setProjectFilter("featured");
                                    setProjectPage(1);
                                }}
                                className={`px-2.5 py-1 rounded font-bold uppercase transition-colors ${
                                    projectFilter === "featured" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                                }`}
                            >
                                In 3D Stack ({featuredProjects.length})
                            </button>
                            <button
                                onClick={() => {
                                    setProjectFilter("unfeatured");
                                    setProjectPage(1);
                                }}
                                className={`px-2.5 py-1 rounded font-bold uppercase transition-colors ${
                                    projectFilter === "unfeatured" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                                }`}
                            >
                                Catalog Only ({nonFeaturedProjects.length})
                            </button>
                        </div>
                    </div>

                    {/* Filter & Search Bar with Limit Selector */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-zinc-950/70 border border-zinc-800/80 p-2.5 rounded-xl">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search by title, stack, ID, or slug..."
                                value={projectSearch}
                                onChange={(e) => {
                                    setProjectSearch(e.target.value);
                                    setProjectPage(1);
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                            />
                            {projectSearch && (
                                <button
                                    onClick={() => {
                                        setProjectSearch("");
                                        setProjectPage(1);
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <select
                            value={projectCategory}
                            onChange={(e) => {
                                setProjectCategory(e.target.value);
                                setProjectPage(1);
                            }}
                            className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-zinc-500"
                        >
                            <option value="all">All Categories</option>
                            {projectCategories
                                .filter((c) => c !== "all")
                                .map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Paginated Projects List */}
                    {filteredProjects.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-zinc-950/40 border border-zinc-800/80 flex flex-col items-center justify-center gap-2">
                            <span className="text-xs text-zinc-400 font-mono">
                                No projects match current search or filters.
                            </span>
                            <button
                                onClick={() => {
                                    setProjectSearch("");
                                    setProjectCategory("all");
                                    setProjectFilter("all");
                                    setProjectPage(1);
                                }}
                                className="text-xs text-cyan-400 hover:underline font-mono"
                            >
                                Reset all filters
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {paginatedProjects.map((p) => {
                                const isFeatured = p.featured === true;
                                const isToggling = togglingSlug === p.slug;

                                return (
                                    <div
                                        key={p.slug}
                                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                            isFeatured
                                                ? "bg-zinc-950/80 border-amber-500/40 hover:border-amber-400/70"
                                                : "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700"
                                        }`}
                                    >
                                        {/* Thumbnail + Title + Meta */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-14 h-9 rounded-lg overflow-hidden bg-black border border-zinc-800 shrink-0 flex items-center justify-center p-0.5">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[10px] font-bold text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                                                        #{p.id}
                                                    </span>
                                                    <h3 className="font-bold text-xs text-white uppercase truncate">
                                                        {p.title}
                                                    </h3>
                                                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded hidden sm:inline">
                                                        {p.category}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                                                    {p.stack}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Interactive Toggle Switch */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <a
                                                href={`/projects/${p.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hidden sm:inline-flex"
                                                title="View Public Page"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </a>

                                            <button
                                                onClick={() => handleToggleFeatured(p.slug, isFeatured)}
                                                disabled={isToggling}
                                                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                                                    isFeatured
                                                        ? "bg-amber-400 text-black border-amber-400 hover:bg-amber-300"
                                                        : "bg-zinc-900 border-zinc-700/80 text-zinc-400 hover:text-white hover:border-zinc-500"
                                                }`}
                                            >
                                                <Star
                                                    className={`w-3 h-3 ${
                                                        isFeatured ? "fill-black text-black" : "text-zinc-500"
                                                    }`}
                                                />
                                                <span>
                                                    {isToggling
                                                        ? "..."
                                                        : isFeatured
                                                        ? "In 3D Stack"
                                                        : "Add to Stack"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Projects Pagination Navigation Bar */}
                    {filteredProjects.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-zinc-500 font-mono text-[11px]">
                                    Showing{" "}
                                    <strong className="text-zinc-200">
                                        {(safeProjectPage - 1) * projectLimit + 1}–
                                        {Math.min(safeProjectPage * projectLimit, filteredProjects.length)}
                                    </strong>{" "}
                                    of <strong className="text-zinc-200">{filteredProjects.length}</strong> works
                                </span>

                                <div className="flex items-center gap-1.5 pl-3 border-l border-zinc-800">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Per page:</span>
                                    <select
                                        value={projectLimit}
                                        onChange={(e) => {
                                            setProjectLimit(Number(e.target.value));
                                            setProjectPage(1);
                                        }}
                                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2 py-0.5 text-[11px] font-mono focus:outline-none focus:border-zinc-500 cursor-pointer"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={allProjects.length || 100}>All ({allProjects.length})</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                <button
                                    onClick={() => setProjectPage((prev) => Math.max(1, prev - 1))}
                                    disabled={safeProjectPage <= 1}
                                    className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 flex items-center gap-1 transition-colors"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    <span>Prev</span>
                                </button>

                                {Array.from({ length: totalProjectPages }, (_, i) => i + 1).map((pg) => (
                                    <button
                                        key={pg}
                                        onClick={() => setProjectPage(pg)}
                                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-colors ${
                                            pg === safeProjectPage
                                                ? "bg-white text-black"
                                                : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
                                        }`}
                                    >
                                        {pg}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setProjectPage((prev) => Math.min(totalProjectPages, prev + 1))}
                                    disabled={safeProjectPage >= totalProjectPages}
                                    className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 flex items-center gap-1 transition-colors"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right (4 cols): Recent Inquiries & Infrastructure */}
                <div className="lg:col-span-4 flex flex-col gap-5">
                    {/* Recent Inquiries Card with Filter & Pagination */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3.5">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                            <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-zinc-300" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                                    Inquiries
                                </h3>
                                {unreadInquiries.length > 0 && (
                                    <span className="text-[9px] font-mono font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded">
                                        {unreadInquiries.length} NEW
                                    </span>
                                )}
                            </div>

                            <Link
                                href="/dashboard/inquiries"
                                className="text-[11px] font-semibold text-zinc-400 hover:text-white flex items-center gap-0.5"
                            >
                                <span>Inbox</span>
                                <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {/* Inquiries Filter Tabs & Batch Mark All Read */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[10px]">
                                <button
                                    onClick={() => {
                                        setInquiryFilter("all");
                                        setInquiryPage(1);
                                    }}
                                    className={`px-2 py-0.5 rounded font-bold uppercase transition-colors ${
                                        inquiryFilter === "all" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    All ({inquiries.length})
                                </button>
                                <button
                                    onClick={() => {
                                        setInquiryFilter("unread");
                                        setInquiryPage(1);
                                    }}
                                    className={`px-2 py-0.5 rounded font-bold uppercase transition-colors ${
                                        inquiryFilter === "unread" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Unread ({unreadInquiries.length})
                                </button>
                            </div>

                            {unreadInquiries.length > 0 && (
                                <button
                                    onClick={handleMarkAllInquiriesRead}
                                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
                                    title="Mark all unread inquiries as read"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    <span>Mark All Read</span>
                                </button>
                            )}
                        </div>

                        {/* Mini Pagination Header Controls if more than 1 page */}
                        {totalInquiryPages > 1 && (
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
                                <span>
                                    Page {safeInquiryPage} of {totalInquiryPages}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setInquiryPage((p) => Math.max(1, p - 1))}
                                        disabled={safeInquiryPage <= 1}
                                        className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 text-zinc-300"
                                        title="Previous Inquiries"
                                    >
                                        <ChevronLeft className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => setInquiryPage((p) => Math.min(totalInquiryPages, p + 1))}
                                        disabled={safeInquiryPage >= totalInquiryPages}
                                        className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 text-zinc-300"
                                        title="Next Inquiries"
                                    >
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {filteredInquiries.length === 0 ? (
                            <div className="p-6 text-center text-xs text-zinc-500 font-mono bg-zinc-950/40 rounded-xl border border-zinc-800/80">
                                {inquiryFilter === "unread" ? "No unread inquiries." : "No contact submissions yet."}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {paginatedInquiries.map((m) => (
                                    <div
                                        key={m.id}
                                        className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-colors ${
                                            !m.read
                                                ? "bg-zinc-900/90 border-amber-500/40"
                                                : "bg-zinc-950/60 border-zinc-800/80"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                {!m.read && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                                )}
                                                <span className="font-bold text-xs text-white truncate">{m.name}</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                                                {new Date(m.createdAt || m.created_at || new Date()).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                                            {m.message}
                                        </p>

                                        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                                            <button
                                                onClick={() => handleToggleMessageRead(m)}
                                                className="text-[10px] font-mono uppercase text-zinc-500 hover:text-white flex items-center gap-1"
                                            >
                                                {m.read ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                                <span>{m.read ? "Unread" : "Mark Read"}</span>
                                            </button>

                                            <a
                                                href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Your Inquiry")}`}
                                                className="text-[10px] font-mono uppercase text-cyan-400 hover:underline"
                                            >
                                                Reply ↗
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* System Readiness Card */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                                Infrastructure Status
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Online
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-1">
                            <span className="text-zinc-400">PostgreSQL (Neon)</span>
                            <span className="font-mono text-zinc-200">Connected</span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-800/50">
                            <span className="text-zinc-400">Cloudinary CDN</span>
                            <span className="font-mono text-zinc-200">Active</span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-800/50">
                            <span className="text-zinc-400">Gmail SMTP</span>
                            <span className="font-mono text-zinc-200">Configured</span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-800/50">
                            <span className="text-zinc-400">JWT Auth Session</span>
                            <span className="font-mono text-zinc-200">Guarded</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
