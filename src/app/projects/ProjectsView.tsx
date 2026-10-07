"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, ArrowRight, ArrowLeft, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/sections/Footer";
import { ProjectData } from "./[slug]/ProjectDetailView";
import db from "@/lib/portfolio-db.json";

interface ProjectsViewProps {
    projects: ProjectData[];
}

export default function ProjectsView({ projects }: ProjectsViewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(6);

    // Extract all unique categories
    const categories = useMemo(() => {
        const cats = new Set<string>();
        projects.forEach((p) => {
            if (p.category) {
                cats.add(p.category);
            }
        });
        return ["All", ...Array.from(cats)];
    }, [projects]);

    // Filter projects by category and search query
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
            const matchesSearch =
                project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.stack.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [projects, selectedCategory, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedProjects = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredProjects.slice(start, start + pageSize);
    }, [filteredProjects, safeCurrentPage, pageSize]);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black relative">
            {/* Fixed Brand Logo */}
            <div className="fixed top-6 left-6 md:top-8 md:left-10 z-50 mix-blend-difference">
                <Link href="/" className="group inline-block">
                    <h1 className="font-sans font-black text-2xl md:text-4xl tracking-tighter text-white flex items-start">
                        {db.firstName}
                        <span className="text-xs md:text-lg font-medium ml-1 -mt-1 md:-mt-2">®</span>
                    </h1>
                </Link>
            </div>

            {/* Global Navigation Hamburger */}
            <Navigation />

            <main className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-32 md:pt-36 pb-24">
                {/* Header Section */}
                <section className="mb-12 md:mb-16">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                        <Link
                            href="/#work"
                            className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform" />
                            <span>Back To Highlights</span>
                        </Link>
                        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                            Archive // 0{projects.length} Projects
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/15">
                        <div>
                            <span className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-500 block mb-3">
                                // Index & Specifications
                            </span>
                            <h1 className="text-6xl sm:text-7xl md:text-8xl font-sans font-black uppercase tracking-tighter text-white mb-4 leading-none">
                                Projects
                            </h1>
                            <p className="text-zinc-400 max-w-2xl text-sm md:text-base leading-relaxed">
                                Complete archive of full-stack applications, enterprise platforms, and digital products engineered with
                                modern technologies.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Filter & Search Bar */}
                <section className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        {categories.map((cat) => {
                            const count = cat === "All" ? projects.length : projects.filter((p) => p.category === cat).length;
                            const isActive = selectedCategory === cat;

                            return (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all border ${
                                        isActive
                                            ? "bg-white text-black border-white font-bold shadow-sm"
                                            : "bg-zinc-950 text-zinc-400 border-white/15 hover:border-white/40 hover:text-white"
                                    }`}
                                >
                                    {cat}
                                    <span className={`ml-2 text-[10px] ${isActive ? "text-zinc-600" : "text-zinc-500"}`}>({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Clean Search Input */}
                    <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search stack or title..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-8 py-2 rounded-full bg-zinc-950 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white font-mono tracking-wide transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setCurrentPage(1);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </section>

                {/* 3-Column Responsive Projects Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
                    <AnimatePresence mode="popLayout">
                        {paginatedProjects.map((project, index) => (
                            <motion.article
                                key={project.slug || project.id}
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                className="group flex flex-col rounded-3xl bg-zinc-950 border border-white/15 hover:border-white/40 transition-all duration-300 overflow-hidden"
                            >
                                {/* Clean Image Stage */}
                                <Link
                                    href={`/projects/${project.slug}`}
                                    className="block relative aspect-[16/9] w-full overflow-hidden bg-zinc-950 border-b border-white/10 group/img"
                                >
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-500 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover/img:bg-transparent transition-colors pointer-events-none" />

                                    {/* Clean ID badge */}
                                    <div className="absolute top-3.5 left-3.5">
                                        <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white tracking-wider">
                                            {project.id}
                                        </span>
                                    </div>
                                </Link>

                                {/* Card Content Body */}
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        {/* Category Label */}
                                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                                            {project.category || "Full Stack Application"}
                                        </div>

                                        {/* Title */}
                                        <Link href={`/projects/${project.slug}`} className="group/title block mb-2.5">
                                            <h2 className="text-xl font-bold uppercase tracking-tight text-white group-hover/title:text-zinc-300 transition-colors">
                                                {project.title}
                                            </h2>
                                        </Link>

                                        {/* Description */}
                                        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed line-clamp-3 mb-5">
                                            {project.description}
                                        </p>
                                    </div>

                                    <div>
                                        {/* Tech Badges */}
                                        <div className="flex flex-wrap gap-1.5 mb-5 pt-3 border-t border-white/10">
                                            {project.tech && project.tech.length > 0 ? (
                                                project.tech.slice(0, 4).map((t, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10"
                                                    >
                                                        {t.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] font-mono text-zinc-500 uppercase">{project.stack}</span>
                                            )}
                                        </div>

                                        {/* Card Actions */}
                                        <div className="flex items-center justify-between pt-1">
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:text-zinc-300 transition-colors"
                                            >
                                                <span>Case Study</span>
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                            </Link>

                                            <div className="flex items-center gap-2">
                                                {project.links.code && (
                                                    <a
                                                        href={project.links.code}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                                                        title="Source Code"
                                                    >
                                                        <Github className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                                {project.links.live && (
                                                    <a
                                                        href={project.links.live}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors"
                                                    >
                                                        <span>Live</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </section>

                {/* Pagination & Limit Bar (Positioned at bottom) */}
                {filteredProjects.length > 0 && (
                    <section className="mt-12 pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6">
                        {/* Range & Limit Selector */}
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                                Showing{" "}
                                <strong className="text-white font-bold">
                                    {(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, filteredProjects.length)}
                                </strong>{" "}
                                of <strong className="text-white font-bold">{filteredProjects.length}</strong> Projects
                            </span>

                            <div className="flex items-center gap-2 pl-4 border-l border-white/15">
                                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Per Page:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="bg-zinc-950 border border-white/20 text-white rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-white transition-colors cursor-pointer"
                                >
                                    <option value={6}>6</option>
                                    <option value={9}>9</option>
                                    <option value={18}>18</option>
                                    <option value={projects.length || 100}>All ({projects.length})</option>
                                </select>
                            </div>
                        </div>

                        {/* Page Navigation Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setCurrentPage((p) => Math.max(1, p - 1));
                                        window.scrollTo({ top: 350, behavior: "smooth" });
                                    }}
                                    disabled={safeCurrentPage <= 1}
                                    className="px-4 py-2 rounded-full border border-white/20 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white hover:border-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-all"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    <span>Prev</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                                        <button
                                            key={pg}
                                            onClick={() => {
                                                setCurrentPage(pg);
                                                window.scrollTo({ top: 350, behavior: "smooth" });
                                            }}
                                            className={`w-9 h-9 rounded-full text-xs font-mono font-bold transition-all ${
                                                pg === safeCurrentPage
                                                    ? "bg-white text-black font-black shadow-md"
                                                    : "border border-white/15 text-zinc-400 hover:text-white hover:border-white/40 bg-zinc-950"
                                            }`}
                                        >
                                            {pg}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => {
                                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                                        window.scrollTo({ top: 350, behavior: "smooth" });
                                    }}
                                    disabled={safeCurrentPage >= totalPages}
                                    className="px-4 py-2 rounded-full border border-white/20 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white hover:border-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-all"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {filteredProjects.length === 0 && (
                    <div className="py-20 text-center border border-white/10 rounded-3xl mt-8">
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                            No projects found matching "{searchQuery}"
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("All");
                                setCurrentPage(1);
                            }}
                            className="mt-3 text-xs font-mono text-cyan-400 hover:underline uppercase tracking-wider"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Editorial Collaboration Section */}
                <section className="mt-32 pt-16 pb-12 border-t border-white/15">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <span className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-500 block mb-3">
                                // INITIATE COLLABORATION
                            </span>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-black uppercase tracking-tighter text-white leading-tight">
                                HAVE A PROJECT <br />
                                <span className="text-zinc-500">IN MIND?</span>
                            </h2>
                            <p className="text-zinc-400 text-xs md:text-sm max-w-xl mt-4 leading-relaxed">
                                Available for select full-stack development, software engineering, and contract work. Let's engineer
                                something extraordinary together.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <Link
                                href="/#contact"
                                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-black font-sans font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                            >
                                <span>GET IN TOUCH</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white font-sans font-bold text-xs uppercase tracking-widest hover:border-white hover:bg-white/5 transition-colors"
                            >
                                <span>HOME</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Architectural Branding Footer */}
            <Footer />
        </div>
    );
}
