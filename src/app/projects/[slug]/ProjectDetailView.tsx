"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ExternalLink,
    Github,
    Calendar,
    User,
    Clock,
    Briefcase,
    Sparkles,
    Layers,
    CheckCircle2,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Code2,
    Database,
    Globe,
    Share2,
    Check,
} from "lucide-react";
import StarBorder from "@/components/StarBorder";

import Navigation from "@/components/Navigation";
import Footer from "@/sections/Footer";
import db from "@/lib/portfolio-db.json";

export interface ProjectData {
    id: string;
    slug: string;
    title: string;
    tagline?: string;
    stack: string;
    description: string;
    longDescription?: string;
    image: string;
    images?: string[];
    links: {
        live: string;
        code: string;
    };
    cta: string;
    category?: string;
    role?: string;
    duration?: string;
    client?: string;
    status?: string;
    features?: string[];
    tech?: {
        name: string;
        category?: string;
    }[];
}

interface ProjectDetailViewProps {
    project: ProjectData;
    prevProject: ProjectData | null;
    nextProject: ProjectData | null;
}

export default function ProjectDetailView({ project, prevProject, nextProject }: ProjectDetailViewProps) {
    const allImages = project.images && project.images.length > 0 ? project.images : [project.image];

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black relative overflow-x-hidden">
            {/* Fixed Brand Logo */}
            <div className="fixed top-6 left-6 md:top-8 md:left-10 z-50 mix-blend-difference">
                <Link href="/" className="group">
                    <h1 className="font-sans font-black text-2xl md:text-4xl tracking-tighter text-white flex items-start">
                        {db.firstName}
                        <span className="text-xs md:text-lg font-medium ml-1 -mt-1 md:-mt-2">®</span>
                    </h1>
                </Link>
            </div>

            {/* Global Navigation Hamburger */}
            <Navigation />

            {/* Main Content Container */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-28 md:pt-36 pb-24">
                {/* Top Breadcrumb & Share Strip */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            href="/#work"
                            className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono uppercase tracking-wider transition-all"
                        >
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                            <span>Highlights</span>
                        </Link>
                        <span className="text-zinc-600">/</span>
                        <Link
                            href="/projects"
                            className="text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                        >
                            All Projects
                        </Link>
                        <span className="text-zinc-600">/</span>
                        <span className="text-xs font-mono uppercase tracking-wider text-white font-semibold truncate max-w-[220px]">
                            {project.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleCopyLink}
                            aria-label="Share project"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono uppercase text-zinc-300 hover:text-white transition-colors"
                            title="Copy Project Link"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-zinc-300" /> : <Share2 className="w-3.5 h-3.5" />}
                            <span>{copied ? "Copied" : "Share"}</span>
                        </button>

                        {project.links.live && (
                            <a
                                href={project.links.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors text-xs font-bold uppercase tracking-wider shadow-lg"
                            >
                                <span>Live Demo</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Hero Section */}
                <section className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.2em] uppercase bg-white/10 text-white border border-white/15">
                            Project {project.id}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-white/5 text-zinc-300 border border-white/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            {project.status || "Completed"}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white mb-6 leading-[0.95]"
                    >
                        {project.title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-lg md:text-2xl text-zinc-300 max-w-4xl font-normal leading-relaxed mb-12 font-serif italic"
                    >
                        "{project.tagline || project.description}"
                    </motion.p>

                    {/* Metadata Spec Sheet */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-zinc-950/70 border border-white/10 backdrop-blur-md mb-12"
                    >
                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1.5 flex items-center gap-1.5">
                                <User className="w-3 h-3 text-zinc-400" /> Role
                            </span>
                            <span className="text-sm font-semibold text-zinc-200">{project.role || "Full Stack Developer"}</span>
                        </div>

                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1.5 flex items-center gap-1.5">
                                <Briefcase className="w-3 h-3 text-zinc-400" /> Client
                            </span>
                            <span className="text-sm font-semibold text-zinc-200">{project.client || "Client Project"}</span>
                        </div>

                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1.5 flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-zinc-400" /> Timeline
                            </span>
                            <span className="text-sm font-semibold text-zinc-200">{project.duration || "Production Delivery"}</span>
                        </div>

                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1.5 flex items-center gap-1.5">
                                <Layers className="w-3 h-3 text-zinc-400" /> Category
                            </span>
                            <span className="text-sm font-semibold text-zinc-200">{project.category || "Full Stack Architecture"}</span>
                        </div>
                    </motion.div>

                    {/* Action Button Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="flex flex-wrap items-center gap-4"
                    >
                        {project.links.live && (
                            <StarBorder
                                as="a"
                                href={project.links.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="#f6d365, #fda085"
                                speed="3s"
                                className="hover:scale-[1.02] transition-transform"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <span>Launch Live Platform</span>
                                    <ExternalLink className="w-4 h-4" />
                                </span>
                            </StarBorder>
                        )}

                        {project.links.code && (
                            <a
                                href={project.links.code}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/15 hover:border-white/30 transition-all text-xs font-bold uppercase tracking-wider"
                            >
                                <Github className="w-4 h-4" />
                                <span>Explore Source Repository</span>
                            </a>
                        )}
                    </motion.div>
                </section>

                {/* Interactive Image Showcase & Gallery */}
                <section className="mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative rounded-3xl md:rounded-[40px] overflow-hidden border border-white/15 bg-zinc-950 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)]"
                    >
                        {/* Top Device Bar */}
                        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/60 border-b border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-zinc-700" />
                                <span className="w-3 h-3 rounded-full bg-zinc-700" />
                                <span className="w-3 h-3 rounded-full bg-zinc-700" />
                            </div>

                            <div className="hidden sm:flex items-center gap-2 px-4 py-1 rounded-full bg-black/50 border border-white/10 text-xs font-mono text-zinc-400">
                                <Globe className="w-3 h-3 text-cyan-400" />
                                <span>{project.links.live || "production-view"}</span>
                            </div>

                            <span className="text-xs font-mono text-zinc-400">
                                {activeImageIndex + 1} / {allImages.length}
                            </span>
                        </div>

                        {/* Main Stage Image */}
                        <div className="relative aspect-[4/3] max-h-[720px] w-full overflow-hidden bg-black flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImageIndex}
                                    src={allImages[activeImageIndex]}
                                    alt={`${project.title} screenshot ${activeImageIndex + 1}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full object-contain"
                                />
                            </AnimatePresence>

                            {/* Prev / Next controls if multiple images */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                                        aria-label="Previous screenshot"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-all hover:scale-110"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                                        aria-label="Next screenshot"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-all hover:scale-110"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Thumbnail Strip */}
                    {allImages.length > 1 && (
                        <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
                            {allImages.map((imgUrl, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`relative rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 w-24 aspect-[4/3] bg-black flex items-center justify-center ${
                                        activeImageIndex === index
                                            ? "border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                                            : "border-white/10 opacity-60 hover:opacity-100"
                                    }`}
                                >
                                    <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Deep Dive: Overview & Architecture */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24 border-t border-white/10 pt-16">
                    <div className="lg:col-span-4">
                        <div className="sticky top-28">
                            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-zinc-500 block mb-3">
                                // System Architecture
                            </span>
                            <h2 className="text-3xl md:text-4xl font-sans font-black uppercase tracking-tight text-white mb-6">
                                The Engineering & Product Vision
                            </h2>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Detailed breakdown of technical execution, engineering trade-offs, and high-stakes user requirements
                                delivered in this project.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6 text-zinc-300 leading-relaxed text-base md:text-lg">
                        {project.longDescription ? (
                            project.longDescription.split("\\n\\n").map((para, i) => (
                                <p key={i} className="leading-relaxed">
                                    {para.replace(/\\\\n/g, "\n")}
                                </p>
                            ))
                        ) : (
                            <p className="leading-relaxed">{project.description}</p>
                        )}
                    </div>
                </section>

                {/* Core Features Grid */}
                {project.features && project.features.length > 0 && (
                    <section className="mb-24 border-t border-white/10 pt-16">
                        <div className="max-w-2xl mb-12">
                            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-zinc-500 block mb-3">
                                // Key Capabilities
                            </span>
                            <h2 className="text-3xl md:text-4xl font-sans font-black uppercase tracking-tight text-white">
                                Engineered Capabilities & Milestones
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {project.features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                    className="p-6 md:p-8 rounded-3xl bg-zinc-950/60 border border-white/10 hover:border-white/30 transition-all group flex items-start gap-4"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white group-hover:scale-110 group-hover:bg-white/10 transition-all">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-mono text-zinc-500 block mb-1">
                                            FEATURE #{String(idx + 1).padStart(2, "0")}
                                        </span>
                                        <h3 className="text-base md:text-lg font-semibold text-white leading-snug">{feature}</h3>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Technologies Deployed */}
                {project.tech && project.tech.length > 0 && (
                    <section className="mb-24 border-t border-white/10 pt-16">
                        <div className="max-w-2xl mb-10">
                            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-zinc-500 block mb-3">
                                // Technology Stack
                            </span>
                            <h2 className="text-3xl md:text-4xl font-sans font-black uppercase tracking-tight text-white">
                                Technologies & Tools Deployed
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {project.tech.map((t, idx) => (
                                <div
                                    key={idx}
                                    className="px-5 py-3 rounded-2xl bg-zinc-950 border border-white/15 flex items-center gap-2.5 hover:border-white/40 transition-colors"
                                >
                                    <Code2 className="w-4 h-4 text-zinc-400" />
                                    <span className="text-sm font-bold text-white tracking-wide">{t.name}</span>
                                    {t.category && (
                                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-zinc-400">
                                            {t.category}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Previous & Next Project Navigation */}
                <section className="border-t border-white/15 pt-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {prevProject ? (
                            <Link
                                href={`/projects/${prevProject.slug}`}
                                className="group p-8 rounded-3xl bg-zinc-950/70 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 mb-2">
                                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                                        Previous Project
                                    </span>
                                    <h4 className="text-xl md:text-2xl font-sans font-bold uppercase tracking-tight text-white group-hover:text-zinc-300 transition-colors">
                                        {prevProject.title}
                                    </h4>
                                </div>
                                <p className="text-xs text-zinc-400 font-mono mt-4 truncate">{prevProject.stack}</p>
                            </Link>
                        ) : (
                            <div />
                        )}

                        {nextProject && (
                            <Link
                                href={`/projects/${nextProject.slug}`}
                                className="group p-8 rounded-3xl bg-zinc-950/70 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between text-right md:items-end"
                            >
                                <div>
                                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center justify-end gap-1.5 mb-2">
                                        Next Project
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <h4 className="text-xl md:text-2xl font-sans font-bold uppercase tracking-tight text-white group-hover:text-zinc-300 transition-colors">
                                        {nextProject.title}
                                    </h4>
                                </div>
                                <p className="text-xs text-zinc-400 font-mono mt-4 truncate">{nextProject.stack}</p>
                            </Link>
                        )}
                    </div>
                </section>

                {/* Editorial Collaboration Section */}
                <section className="mt-32 pt-16 pb-12 border-t border-white/15">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <span className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-500 block mb-3">
                                // INITIATE COLLABORATION
                            </span>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-sans font-black uppercase tracking-tighter text-white leading-tight">
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
