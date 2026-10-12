"use client";

import React from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowUpRight,
    Download,
    Mail,
    Phone,
    MapPin,
    Globe,
    Github,
    Linkedin,
    ExternalLink,
    Code2,
    Briefcase,
    GraduationCap,
    Award,
    Layers,
    CheckCircle2,
    Sparkles,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/sections/Footer";
import { PortfolioData } from "@/lib/portfolio-service";

interface AboutViewProps {
    data: PortfolioData;
}

export default function AboutView({ data }: AboutViewProps) {
    const resumeDownloadUrl = data.resumeUrl || "/Moniruzzaman_Mahdi_Full_Stack_Developer.pdf";

    // Clean display handles for social links
    const githubHandle = data.socials?.github
        ? data.socials.github.replace(/^https?:\/\/(www\.)?github\.com\/?/, "github.com/")
        : "github.com/mahdimonir";

    const linkedinHandle = data.socials?.linkedin
        ? data.socials.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, "linkedin.com/in/").replace(/\/$/, "")
        : "linkedin.com/in/moniruzzaman-mahdi";

    // Dynamic flagship systems from database
    const flagshipProjects = (
        data.projects?.filter((p) => p.featured).length > 0 ? data.projects.filter((p) => p.featured) : data.projects || []
    ).slice(0, 4);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black relative">
            {/* Fixed Brand Monogram Logo */}
            <div className="fixed top-6 left-6 md:top-8 md:left-10 z-50 mix-blend-difference">
                <Link href="/" className="group inline-block">
                    <h1 className="font-sans font-black text-2xl md:text-4xl tracking-tighter text-white flex items-start">
                        {data.firstName || "MAHDI"}
                        <span className="text-xs md:text-lg font-medium ml-1 -mt-1 md:-mt-2">®</span>
                    </h1>
                </Link>
            </div>

            {/* Global Navigation */}
            <Navigation />

            {/* Main Page Container */}
            <main className="max-w-[1500px] mx-auto px-6 sm:px-8 lg:px-16 pt-28 md:pt-36 pb-28">
                {/* Top Utility Bar */}
                <div className="flex items-center justify-between mb-12 md:mb-16 pb-4 border-b border-white/10">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1.5 transition-transform" />
                        <span>{data.about?.topBackLabel || "Back To Home"}</span>
                    </Link>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <a
                            href={resumeDownloadUrl}
                            download="Moniruzzaman_Mahdi_Full_Stack_Developer.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2 px-4 py-2 border border-white/20 bg-white/5 hover:bg-white hover:text-black rounded-none text-xs font-mono font-bold uppercase tracking-[0.18em] transition-all duration-300"
                            title="Download Official Resume PDF"
                        >
                            <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:text-black transition-colors" />
                            <span>{data.about?.topResumeLabel || "Download Resume"}</span>
                        </a>

                        <Link
                            href="/#contact"
                            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold uppercase tracking-[0.18em] transition-colors"
                        >
                            <span>{data.about?.topContactLabel || "Initiate Contact"}</span>
                        </Link>
                    </div>
                </div>

                {/* HERO / PROFILE SECTION */}
                <section className="mb-24 md:mb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                        {/* Left: Headline & Bio */}
                        <div className="lg:col-span-8 space-y-6">
                            <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 block">
                                {data.about?.label || "00 // DOSSIER & PROFILE"}
                            </span>

                            {/* Full Name strictly on visible UI */}
                            <h1 className="font-sans font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter text-white uppercase leading-[0.88] select-none">
                                {data.name || "Moniruzzaman Mahdi"}
                            </h1>

                            {/* Role with signature cyan accent */}
                            <div className="flex items-center gap-3 pt-2">
                                <span className="h-[2px] w-8 bg-cyan-400 shrink-0" />
                                <h2 className="font-mono text-xs sm:text-sm md:text-base uppercase tracking-[0.25em] text-zinc-300 font-bold">
                                    {data.role || "Full Stack Developer & Software Architect"}
                                </h2>
                            </div>

                            {/* Bio Narrative from Dashboard */}
                            <p className="font-sans text-base sm:text-lg md:text-xl text-zinc-300 font-normal leading-relaxed max-w-3xl pt-2">
                                {data.about?.summary ||
                                    data.hero?.subheadline ||
                                    "Building scalable web applications, automating the complex and transforming static systems into intelligent architectures. Focused on modular NestJS APIs, Next.js full-stack workflows, Go microservices, and PostgreSQL data systems with clean architecture and strict type safety."}
                            </p>

                            {/* Coordinates & Direct Links Strip */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs font-mono text-zinc-400 border-t border-white/10">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                        <span>{data.location || "Bangladesh"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                        <a href={`mailto:${data.email}`} className="hover:text-white transition-colors">
                                            {data.email}
                                        </a>
                                    </div>
                                    {data.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                            <a href={`tel:${data.phone}`} className="hover:text-white transition-colors">
                                                {data.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {data.socials?.github && (
                                        <div className="flex items-center gap-2">
                                            <Github className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                            <a
                                                href={data.socials.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-white transition-colors"
                                            >
                                                {githubHandle}
                                            </a>
                                        </div>
                                    )}
                                    {data.socials?.linkedin && (
                                        <div className="flex items-center gap-2">
                                            <Linkedin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                            <a
                                                href={data.socials.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-white transition-colors"
                                            >
                                                {linkedinHandle}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                        <a
                                            href={data.about?.websiteUrl || "https://mahdimonir.dev"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-white transition-colors"
                                        >
                                            {(data.about?.websiteUrl || "mahdimonir.dev").replace(/^https?:\/\//, "")}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Editorial Portrait Card */}
                        <div className="lg:col-span-4 flex justify-center lg:justify-end">
                            <div className="relative group w-full max-w-sm">
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-white/10 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
                                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/15 bg-zinc-950 flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={data.about?.avatarUrl || "/Moniruzzaman_Mahdi.png"}
                                        alt="Moniruzzaman Mahdi (@mahdimonir / Mahdi) — Full Stack Developer & Software Architect Portrait"
                                        title="Moniruzzaman Mahdi — Full Stack Developer & Software Architect"
                                        className="w-full h-full object-cover object-top filter grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                                        <span className="uppercase tracking-widest font-bold">
                                            {data.about?.portraitTag || "ENGINEERING DOSSIER"}
                                        </span>
                                        <span className="text-cyan-400">{data.about?.portraitStatus || "STATUS: ACTIVE"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 01 // WORK EXPERIENCE */}
                <section className="mb-24 md:mb-32 pt-12 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                        {/* Left Column Label */}
                        <div className="md:col-span-4 lg:col-span-3 space-y-2">
                            <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 block">
                                {data.about?.experienceBadge || "01 // CAREER"}
                            </span>
                            <h3 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                                {data.about?.experienceHeading || "Work Experience"}
                            </h3>
                            <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                                {data.about?.experienceDescription ||
                                    "Production track record across software engineering, client platforms, and high-concurrency systems."}
                            </p>
                        </div>

                        {/* Right Column Timeline */}
                        <div className="md:col-span-8 lg:col-span-9 space-y-12">
                            {data.about?.experience?.map((exp, idx) => (
                                <div key={exp.company + idx} className="space-y-3 relative group">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/10 pb-3">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h4 className="font-sans text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                                {exp.company}
                                            </h4>
                                            {exp.current && (
                                                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 bg-white text-black">
                                                    CURRENT
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                            {exp.period}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs sm:text-sm font-mono text-cyan-400">
                                        <span>{exp.role}</span>
                                        {exp.location && (
                                            <>
                                                <span className="text-zinc-600">•</span>
                                                <span className="text-zinc-400">{exp.location}</span>
                                            </>
                                        )}
                                        {exp.companyUrl && (
                                            <>
                                                <span className="text-zinc-600">•</span>
                                                <a
                                                    href={exp.companyUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-zinc-400 hover:text-white inline-flex items-center gap-0.5 transition-colors"
                                                >
                                                    Website ↗
                                                </a>
                                            </>
                                        )}
                                    </div>

                                    {exp.description && (
                                        <p className="font-sans text-sm sm:text-base text-zinc-300 leading-relaxed pt-1">
                                            {exp.description}
                                        </p>
                                    )}

                                    {exp.achievements && exp.achievements.length > 0 && (
                                        <ul className="space-y-2 pt-2">
                                            {exp.achievements.map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-start gap-3 text-xs sm:text-sm text-zinc-400 leading-relaxed"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 02 // SELECTED PRODUCTION ARCHITECTURES */}
                <section className="mb-24 md:mb-32 pt-12 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                        {/* Left Column Label */}
                        <div className="md:col-span-4 lg:col-span-3 space-y-2">
                            <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 block">
                                {data.about?.projectsBadge || "02 // SYSTEMS"}
                            </span>
                            <h3 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                                {data.about?.projectsHeading || "Flagship Systems"}
                            </h3>
                            <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                                {data.about?.projectsDescription ||
                                    "Production web platforms, SaaS multi-tenancy, and high-performance engines built end-to-end."}
                            </p>
                            <div className="pt-3">
                                <Link
                                    href="/projects"
                                    className="font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                                >
                                    <span>
                                        {data.about?.projectsArchiveLabel || "Archive"} ({data.projects?.length || 0})
                                    </span>
                                    <span>↗</span>
                                </Link>
                            </div>
                        </div>

                        {/* Right Column Projects Grid */}
                        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {flagshipProjects.map((project) => (
                                <div
                                    key={project.slug || project.id}
                                    className="p-6 border border-white/10 bg-zinc-950/60 hover:border-white/30 transition-all duration-300 flex flex-col justify-between group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                {project.category || project.status || "PRODUCTION"}
                                            </span>
                                            {project.links?.live && (
                                                <a
                                                    href={project.links.live}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-[11px] text-zinc-400 hover:text-cyan-400 inline-flex items-center gap-1 transition-colors"
                                                >
                                                    <span>Live</span>
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>

                                        <h4 className="font-sans text-xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                                            {project.title}
                                        </h4>

                                        <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3">
                                            {project.description}
                                        </p>
                                    </div>

                                    <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                                        <span className="font-mono text-[11px] text-cyan-400/90 truncate">{project.stack}</span>
                                        <Link
                                            href={`/projects/${project.slug}`}
                                            className="font-mono text-[11px] text-zinc-400 hover:text-white uppercase tracking-wider shrink-0 transition-colors"
                                        >
                                            Case Study ↗
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 03 // TECHNICAL STACK */}
                <section className="mb-24 md:mb-32 pt-12 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                        {/* Left Column Label */}
                        <div className="md:col-span-4 lg:col-span-3 space-y-2">
                            <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 block">
                                {data.about?.skillsBadge || "03 // CAPABILITIES"}
                            </span>
                            <h3 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                                {data.about?.skillsHeading || "Technical Stack"}
                            </h3>
                            <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                                {data.about?.skillsDescription ||
                                    "Languages, backend frameworks, relational databases, cloud infrastructure, and tool ecosystem."}
                            </p>
                        </div>

                        {/* Right Column Stack Groups */}
                        <div className="md:col-span-8 lg:col-span-9 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {data.skills && data.skills.length > 0 ? (
                                    data.skills.map((group, idx) => (
                                        <div key={group.category + idx} className="space-y-3">
                                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white font-bold flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-cyan-400" />
                                                <span>{group.category}</span>
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {group.items.map((it) => (
                                                    <span
                                                        key={it.name}
                                                        className="px-3 py-1.5 border border-white/10 bg-white/5 font-mono text-xs text-zinc-300 hover:border-cyan-400/60 hover:text-white transition-colors"
                                                    >
                                                        {it.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="space-y-3">
                                        <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white font-bold">
                                            Core Technologies
                                        </h4>
                                        <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                                            Next.js, React, Node.js, NestJS, Go, PostgreSQL, Prisma, MongoDB, Docker, Tailwind CSS
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 04 // DETAILED ENGINEERING SPECIALIZATIONS */}
                <section className="mb-24 md:mb-32 pt-12 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                        {/* Left Column Label */}
                        <div className="md:col-span-4 lg:col-span-3 space-y-2">
                            <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold block">
                                {data.about?.specializationsBadge || "04 // SPECIALIZATIONS"}
                            </span>
                            <h3 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                                {data.about?.specializationsHeading || "Engineering Specializations"}
                            </h3>
                            <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                                {data.about?.specializationsDescription ||
                                    "In-depth architectural competencies, multi-tenant engineering, rapid zero-to-one MVP delivery, and high-concurrency data systems."}
                            </p>
                        </div>

                        {/* Right Column Detailed Specializations Grid */}
                        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {(data.about?.specializations && data.about.specializations.length > 0
                                ? data.about.specializations
                                : (data.about?.focus || []).map((title, i) => ({
                                      id: `spec-${i + 1}`,
                                      title,
                                      description:
                                          "Core architectural capability executed with strict type safety and modular service boundaries.",
                                      skills: ["TypeScript", "Next.js", "PostgreSQL"],
                                      points: ["Engineered for production resilience and scale"],
                                  }))
                            ).map((spec, idx) => (
                                <div
                                    key={spec.id || spec.title + idx}
                                    className="p-6 sm:p-8 border border-white/10 bg-zinc-950/60 hover:border-white/30 transition-all duration-300 flex flex-col justify-between space-y-5 group"
                                >
                                    <div className="space-y-3.5">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                                                SPEC // 0{idx + 1}
                                            </span>
                                            <Sparkles className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                                        </div>

                                        <h4 className="font-sans text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                                            {spec.title}
                                        </h4>

                                        <p className="font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">{spec.description}</p>

                                        {/* Architecture Points / Deliverables */}
                                        {spec.points && spec.points.length > 0 && (
                                            <div className="pt-3 border-t border-white/5 space-y-2">
                                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 block font-semibold">
                                                    KEY DELIVERABLES
                                                </span>
                                                <ul className="space-y-2">
                                                    {spec.points.map((pt, pIdx) => (
                                                        <li
                                                            key={pIdx}
                                                            className="flex items-start gap-2.5 text-xs text-zinc-400 group-hover:text-zinc-300 leading-relaxed transition-colors"
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                                                            <span>{pt}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tech Stack Pills */}
                                    {spec.skills && spec.skills.length > 0 && (
                                        <div className="pt-4 border-t border-white/5 space-y-2">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 block font-semibold">
                                                CORE STACK
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {spec.skills.map((skill, sIdx) => (
                                                    <span
                                                        key={sIdx}
                                                        className="font-mono text-[10px] px-2.5 py-1 border border-white/10 bg-white/5 text-zinc-300 group-hover:border-white/20 transition-colors"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 05 // EDUCATION & CREDENTIALS */}
                <section className="mb-24 md:mb-32 pt-12 border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                        {/* Left Column Label */}
                        <div className="md:col-span-4 lg:col-span-3 space-y-2">
                            <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 block">
                                {data.about?.credentialsBadge || "05 // CREDENTIALS"}
                            </span>
                            <h3 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                                {data.about?.credentialsHeading || "Education & Certifications"}
                            </h3>
                            <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                                {data.about?.credentialsDescription ||
                                    "Formal academic background, verified industry courses, and cohort training."}
                            </p>
                        </div>

                        {/* Right Column Education & Certs */}
                        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-10">
                            {/* Academic Education */}
                            <div className="space-y-6">
                                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white font-bold flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                                    <span>{data.about?.educationHeading || "Formal Education"}</span>
                                </h4>

                                <div className="space-y-5">
                                    {data.about?.education?.map((edu, idx) => (
                                        <div key={edu.institution + idx} className="space-y-1 border-b border-white/5 pb-4">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <h5 className="font-sans text-base font-bold text-white">{edu.institution}</h5>
                                                <span className="font-mono text-[11px] text-zinc-500 whitespace-nowrap">{edu.period}</span>
                                            </div>
                                            <p className="font-sans text-sm text-zinc-400">{edu.degree}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Verified Certifications */}
                            <div className="space-y-6">
                                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white font-bold flex items-center gap-2">
                                    <Award className="w-4 h-4 text-cyan-400" />
                                    <span>{data.about?.coursesHeading || "Certifications & Cohorts"}</span>
                                </h4>

                                <div className="space-y-5">
                                    {data.about?.courses?.map((course, idx) => (
                                        <div key={course.title + idx} className="space-y-1 border-b border-white/5 pb-4">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <h5 className="font-sans text-base font-bold text-white flex items-center gap-2">
                                                    <span>{course.title}</span>
                                                    {course.certificateUrl && (
                                                        <a
                                                            href={course.certificateUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-cyan-400 hover:text-cyan-300 text-xs font-mono"
                                                            title="Verify Credential"
                                                        >
                                                            ↗
                                                        </a>
                                                    )}
                                                </h5>
                                                <span className="font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                                                    {course.period}
                                                </span>
                                            </div>
                                            <p className="font-sans text-sm text-zinc-400">{course.institution}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 06 // ACTION CALLOUT */}
                <section className="pt-12 pb-16 border-t border-white/10">
                    <div className="p-8 sm:p-12 md:p-16 border border-white/15 bg-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-3 max-w-xl">
                            <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-400 block font-bold">
                                {data.about?.ctaLabel || "// LET'S COLLABORATE"}
                            </span>
                            <h3 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter text-white leading-tight">
                                {data.about?.ctaHeading || "Have an architecture or system to build?"}
                            </h3>
                            <p className="font-sans text-sm text-zinc-400 leading-relaxed">
                                {data.about?.ctaDescription ||
                                    "Available for high-impact full-stack roles, system architecture consulting, and rapid MVP engineering."}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
                            <a
                                href={resumeDownloadUrl}
                                download="Moniruzzaman_Mahdi_Full_Stack_Developer.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 bg-white/5 hover:bg-white hover:text-black font-mono font-bold text-xs uppercase tracking-[0.18em] transition-all duration-300"
                            >
                                <Download className="w-4 h-4 text-cyan-400 hover:text-black transition-colors" />
                                <span>{data.about?.ctaResumeButtonText || "Download PDF Resume"}</span>
                            </a>
                            <Link
                                href="/#contact"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black hover:bg-zinc-200 font-mono font-bold text-xs uppercase tracking-[0.18em] transition-colors shadow-lg"
                            >
                                <span>{data.about?.ctaContactButtonText || "Initiate Contact"}</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Global Footer matching Homepage */}
            <Footer />
        </div>
    );
}
