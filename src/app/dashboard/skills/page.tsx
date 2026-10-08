"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { DashboardFormSkeleton } from "@/components/dashboard/DashboardSkeletons";
import {
    Cpu,
    Tag,
    Layers,
    Plus,
    Trash2,
    Search,
    Save,
    RotateCcw,
    X,
    Code2,
    Sparkles,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

export interface MasterTech {
    id: number;
    name: string;
    role: string;
    iconUrl?: string | null;
    _count?: { projectTechs: number; skillGroupItems: number };
}

export interface CategoryOption {
    id: number;
    slug: string;
    label: string;
    order: number;
    _count?: { projects: number };
}

export interface SkillItem {
    name: string;
    url: string;
}

export interface SkillCategory {
    category: string;
    items: SkillItem[];
}

type ActiveView = "registry" | "categories" | "groups";

export default function SkillsDashboardPage() {
    const [view, setView] = useState<ActiveView>("registry");
    const [masterTechs, setMasterTechs] = useState<MasterTech[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [skillGroups, setSkillGroups] = useState<SkillCategory[]>([]);
    const [savedSkillGroups, setSavedSkillGroups] = useState<SkillCategory[]>([]);

    const [loading, setLoading] = useState(true);
    const [savingGroups, setSavingGroups] = useState(false);
    const [techSearch, setTechSearch] = useState("");
    const [domainFilter, setDomainFilter] = useState("all");

    // Form states
    const [newTechName, setNewTechName] = useState("");
    const [newTechRole, setNewTechRole] = useState("Frontend");
    const [newTechIcon, setNewTechIcon] = useState("");

    const [newCategoryLabel, setNewCategoryLabel] = useState("");
    const [newCategorySlug, setNewCategorySlug] = useState("");

    const loadData = useCallback(async () => {
        try {
            const [techRes, catRes, portRes] = await Promise.all([
                fetch("/api/tech-stacks").catch(() => null),
                fetch("/api/categories").catch(() => null),
                fetch("/api/portfolio?scope=skills").catch(() => null),
            ]);

            const techData = techRes && techRes.ok ? await techRes.json().catch(() => []) : [];
            const catData = catRes && catRes.ok ? await catRes.json().catch(() => []) : [];
            const portData = portRes && portRes.ok ? await portRes.json().catch(() => ({})) : {};

            if (Array.isArray(techData)) setMasterTechs(techData);
            if (Array.isArray(catData)) setCategories(catData);
            if (Array.isArray(portData?.skills)) {
                setSkillGroups(portData.skills);
                setSavedSkillGroups(JSON.parse(JSON.stringify(portData.skills)));
            }
        } catch (err) {
            console.error("Failed to load skills data:", err);
            toast.error("Failed to load technologies");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isGroupsDirty = JSON.stringify(skillGroups) !== JSON.stringify(savedSkillGroups);

    // Save skill groups to portfolio (sends ONLY the skills slice)
    const handleSaveSkillGroups = async () => {
        setSavingGroups(true);
        try {
            const res = await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ skills: skillGroups }),
            });

            if (res.ok) {
                setSavedSkillGroups(JSON.parse(JSON.stringify(skillGroups)));
                toast.success("Skill showcase groups saved!");
            } else {
                toast.error("Failed to save skill groups.");
            }
        } catch {
            toast.error("Network error while saving.");
        } finally {
            setSavingGroups(false);
        }
    };

    // Master Tech CRUD
    const handleCreateTech = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTechName.trim() || !newTechRole.trim()) {
            toast.error("Name and role are required");
            return;
        }

        try {
            const res = await fetch("/api/tech-stacks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: newTechName.trim(),
                    role: newTechRole.trim(),
                    iconUrl: newTechIcon.trim() || null,
                }),
            });
            const data = await res.json();
            if (res.ok && data.tech) {
                toast.success(`Registered "${data.tech.name}"!`);
                setNewTechName("");
                setNewTechIcon("");
                loadData();
            } else {
                toast.error(data.error || "Failed to register technology");
            }
        } catch {
            toast.error("Network error creating technology");
        }
    };

    const handleDeleteTech = async (id: number, name: string) => {
        if (!confirm(`Permanently delete "${name}" from master tech database?`)) return;
        try {
            const res = await fetch(`/api/tech-stacks?id=${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                toast.info(`Deleted "${name}"`);
                loadData();
            } else {
                toast.error("Failed to delete technology");
            }
        } catch {
            toast.error("Network error deleting technology");
        }
    };

    // Category CRUD
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryLabel.trim()) {
            toast.error("Category label is required");
            return;
        }
        const slug = newCategorySlug.trim() || newCategoryLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    label: newCategoryLabel.trim(),
                    slug,
                    order: categories.length,
                }),
            });
            const data = await res.json();
            if (res.ok && data.category) {
                toast.success(`Created category "${data.category.label}"!`);
                setNewCategoryLabel("");
                setNewCategorySlug("");
                loadData();
            } else {
                toast.error(data.error || "Failed to create category");
            }
        } catch {
            toast.error("Network error creating category");
        }
    };

    const handleDeleteCategory = async (id: number, label: string) => {
        if (!confirm(`Delete category "${label}"?`)) return;
        try {
            const res = await fetch(`/api/categories?id=${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                toast.info(`Category "${label}" deleted`);
                loadData();
            } else {
                toast.error("Failed to delete category");
            }
        } catch {
            toast.error("Network error deleting category");
        }
    };

    // Skill Group manipulators
    const addSkillGroup = () => {
        setSkillGroups((prev) => [
            ...prev,
            {
                category: "New Tech Group",
                items: [
                    {
                        name: "TypeScript",
                        url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
                    },
                ],
            },
        ]);
        toast.info("Added skill group");
    };

    const removeSkillGroup = (index: number) => {
        if (confirm(`Remove skill group "${skillGroups[index].category}"?`)) {
            setSkillGroups((prev) => prev.filter((_, i) => i !== index));
            toast.info("Skill group removed");
        }
    };

    const addSkillItemToGroup = (groupIndex: number, tech?: MasterTech) => {
        setSkillGroups((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            next[groupIndex].items.push({
                name: tech ? tech.name : "New Technology",
                url: tech?.iconUrl || "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
            });
            return next;
        });
    };

    const removeSkillItemFromGroup = (groupIndex: number, itemIndex: number) => {
        setSkillGroups((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            next[groupIndex].items.splice(itemIndex, 1);
            return next;
        });
    };

    // Filter master techs
    const filteredMasterTechs = useMemo(() => {
        return masterTechs.filter((t) => {
            const matchesDomain =
                domainFilter === "all" || t.role.toLowerCase() === domainFilter.toLowerCase();
            const matchesSearch =
                !techSearch.trim() ||
                t.name.toLowerCase().includes(techSearch.toLowerCase().trim()) ||
                t.role.toLowerCase().includes(techSearch.toLowerCase().trim());
            return matchesDomain && matchesSearch;
        });
    }, [masterTechs, domainFilter, techSearch]);

    const inputClass =
        "w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all";
    const labelClass =
        "text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between";

    if (loading) {
        return <DashboardFormSkeleton title="Tech & Stacks" />;
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        Tech Stacks & Categories
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                            {masterTechs.length} In Database
                        </span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Reusable master database of technologies, project taxonomy categories, and showcase presentation groups.
                    </p>
                </div>

                {view === "groups" && (
                    <div className="flex items-center gap-2.5">
                        {isGroupsDirty && (
                            <button
                                onClick={() => setSkillGroups(JSON.parse(JSON.stringify(savedSkillGroups)))}
                                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white px-3 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Discard
                            </button>
                        )}
                        <button
                            onClick={handleSaveSkillGroups}
                            disabled={savingGroups || !isGroupsDirty}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                                !isGroupsDirty
                                    ? "bg-zinc-800 text-zinc-500 cursor-default"
                                    : "bg-white text-black hover:bg-zinc-200"
                            }`}
                        >
                            {savingGroups ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save Groups</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Sub-View Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto">
                <button
                    onClick={() => setView("registry")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                        view === "registry"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Cpu className="w-4 h-4" />
                    <span>Master Tech Registry ({masterTechs.length})</span>
                </button>

                <button
                    onClick={() => setView("categories")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                        view === "categories"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Tag className="w-4 h-4" />
                    <span>Project Categories ({categories.length})</span>
                </button>

                <button
                    onClick={() => setView("groups")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                        view === "groups"
                            ? "bg-white text-black font-extrabold shadow-sm"
                            : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>Showcase Groups ({skillGroups.length})</span>
                </button>
            </div>

            {/* ========================================================================= */}
            {/* VIEW 1: MASTER TECH REGISTRY */}
            {/* ========================================================================= */}
            {view === "registry" && (
                <div className="flex flex-col gap-6">
                    {/* Add Technology Card */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
                        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-800">
                            <Plus className="w-4 h-4 text-zinc-300" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                                Register New Technology
                            </h2>
                        </div>

                        <form onSubmit={handleCreateTech} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-4">
                                <label className={labelClass}>Technology Name</label>
                                <input
                                    className={inputClass}
                                    placeholder="e.g. Redis, GraphQL, Docker"
                                    value={newTechName}
                                    onChange={(e) => setNewTechName(e.target.value)}
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className={labelClass}>Role / Category</label>
                                <select
                                    className={inputClass}
                                    value={newTechRole}
                                    onChange={(e) => setNewTechRole(e.target.value)}
                                >
                                    <option value="Frontend">Frontend</option>
                                    <option value="Backend">Backend</option>
                                    <option value="Database">Database</option>
                                    <option value="DevOps">DevOps</option>
                                    <option value="Media">Media / Creative</option>
                                </select>
                            </div>

                            <div className="sm:col-span-3">
                                <label className={labelClass}>SVG Icon URL (Optional)</label>
                                <input
                                    className={inputClass + " font-mono text-xs"}
                                    placeholder="https://cdn.jsdelivr.net/..."
                                    value={newTechIcon}
                                    onChange={(e) => setNewTechIcon(e.target.value)}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <button
                                    type="submit"
                                    className="w-full bg-white text-black hover:bg-zinc-200 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                                >
                                    Add Tech
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-2xl">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search technologies..."
                                value={techSearch}
                                onChange={(e) => setTechSearch(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                            />
                        </div>

                        {/* Domain Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            {["all", "Frontend", "Backend", "Database", "DevOps", "Media"].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDomainFilter(d)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                                        domainFilter === d
                                            ? "bg-white text-black font-bold"
                                            : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                                    }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Master Tech Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {filteredMasterTechs.map((t) => (
                            <div
                                key={t.id}
                                className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between gap-3 group hover:border-zinc-700 transition-all shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                                        {t.role}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteTech(t.id, t.name)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 rounded transition-opacity"
                                        title="Delete Technology"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1.5 shrink-0">
                                        {t.iconUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={t.iconUrl}
                                                alt={t.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLElement).style.opacity = "0.3";
                                                }}
                                            />
                                        ) : (
                                            <Code2 className="w-4 h-4 text-zinc-600" />
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-white truncate">{t.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: PROJECT CATEGORIES TAXONOMY */}
            {/* ========================================================================= */}
            {view === "categories" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                    {/* Add Category Form (5 cols) */}
                    <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                            <Plus className="w-4 h-4 text-zinc-300" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                                Create Project Category
                            </h2>
                        </div>

                        <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
                            <div>
                                <label className={labelClass}>Category Display Label</label>
                                <input
                                    className={inputClass}
                                    placeholder="e.g. Artificial Intelligence"
                                    value={newCategoryLabel}
                                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>URL Slug (Optional)</label>
                                <input
                                    className={inputClass + " font-mono text-xs"}
                                    placeholder="e.g. ai-ml"
                                    value={newCategorySlug}
                                    onChange={(e) => setNewCategorySlug(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-white text-black hover:bg-zinc-200 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                            >
                                Add Category
                            </button>
                        </form>
                    </div>

                    {/* Existing Categories List (7 cols) */}
                    <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-zinc-300" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                                    Configured Categories ({categories.length})
                                </h2>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {categories.map((c) => (
                                <div
                                    key={c.id}
                                    className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-4 h-4 text-cyan-400" />
                                        <div>
                                            <div className="text-sm font-bold text-white">{c.label}</div>
                                            <div className="text-xs font-mono text-zinc-500">slug: /{c.slug}</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteCategory(c.id, c.label)}
                                        className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                                        title="Delete Category"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: SHOWCASE GROUPS */}
            {/* ========================================================================= */}
            {view === "groups" && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold uppercase tracking-wider text-white">
                                Public Portfolio Showcase Groups
                            </h2>
                            <p className="text-xs text-zinc-400">
                                The categorized skill sections rendered on your public portfolio page.
                            </p>
                        </div>
                        <button
                            onClick={addSkillGroup}
                            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Showcase Group
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 w-full">
                        {skillGroups.map((group, gIdx) => (
                            <div
                                key={gIdx}
                                className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-700 transition-all shadow-sm"
                            >
                                <div>
                                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                                        <input
                                            className="bg-transparent font-black text-sm uppercase tracking-wider text-white border-b border-transparent focus:border-zinc-400 focus:outline-none py-1 w-full"
                                            value={group.category}
                                            onChange={(e) => {
                                                const next = [...skillGroups];
                                                next[gIdx].category = e.target.value;
                                                setSkillGroups(next);
                                            }}
                                            placeholder="Group Label"
                                        />
                                        <button
                                            onClick={() => removeSkillGroup(gIdx)}
                                            className="p-1 text-zinc-500 hover:text-rose-400 rounded"
                                            title="Delete Group"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Items List */}
                                    <div className="flex flex-col gap-2">
                                        {group.items.map((item, itemIdx) => (
                                            <div
                                                key={itemIdx}
                                                className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 shrink-0">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={item.url}
                                                            alt={item.name}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => {
                                                                (e.target as HTMLElement).style.opacity = "0.2";
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-zinc-200 truncate">
                                                        {item.name}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => removeSkillItemFromGroup(gIdx, itemIdx)}
                                                    className="text-zinc-500 hover:text-rose-400 p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => addSkillItemToGroup(gIdx)}
                                    className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Technology
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
