"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { usePortfolioData } from "@/lib/PortfolioContext";

const Footer = () => {
    const data = usePortfolioData();
    const footerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: footerRef,
        offset: ["start end", "end end"],
    });

    const textScale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
    const textOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
        },
    };

    return (
        <footer
            ref={footerRef}
            className="bg-black text-white font-sans pt-12 md:pt-20 border-t border-white min-h-screen md:h-screen flex flex-col justify-between"
        >
            {/* Mobile View: Clean, Minimal, and Simple */}
            <motion.div
                className="md:hidden px-6 w-full flex flex-col items-center text-center gap-6 shrink-0"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">Full Stack Developer</p>
                    <h2 className="text-base font-semibold uppercase tracking-wider">{data.name || "Moniruzzaman Mahdi"}</h2>
                    <a
                        href={`mailto:${data.email}`}
                        className="text-xs text-white/80 hover:text-white underline underline-offset-4 mt-1 font-mono tracking-wide"
                    >
                        {data.email}
                    </a>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-3 border-y border-white/10 w-full text-xs font-medium uppercase tracking-wider"
                >
                    <Link href="/projects" className="text-white/80 hover:text-white transition-colors">
                        Works ↗
                    </Link>
                    <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                        About ↗
                    </Link>
                    {data.socials?.github && (
                        <a
                            href={data.socials.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            GitHub ↗
                        </a>
                    )}
                    {data.socials?.linkedin && (
                        <a
                            href={data.socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            LinkedIn ↗
                        </a>
                    )}
                    {data.socials?.portfolio3d && (
                        <a
                            href={data.socials.portfolio3d}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            3D ↗
                        </a>
                    )}
                </motion.div>

                <motion.p variants={itemVariants} className="text-[11px] font-medium uppercase tracking-widest text-white/40">
                    © 2026 {data.firstName || "MAHDI"}
                </motion.p>
            </motion.div>

            {/* Desktop View: 4-Column Architectural Grid, Dynamic & Justify-Between */}
            <motion.div
                className="hidden md:flex md:flex-row items-start justify-between gap-x-8 px-6 md:px-12 lg:px-16 max-w-[1600px] mx-auto w-full shrink-0 text-left"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {/* Column 1: IDENTIFICATION */}
                <motion.div variants={itemVariants} className="flex flex-col items-start gap-1">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-widest mb-4 text-white/80">Identification</h3>
                    <p className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide leading-relaxed">
                        {data.name || "Moniruzzaman Mahdi"}
                    </p>
                    <p className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide leading-relaxed text-white/60">
                        {data.role || "Full Stack Developer"}
                    </p>
                    <p className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide leading-relaxed text-white/60">
                        {data.location || "Bangladesh"}
                    </p>
                </motion.div>

                {/* Column 2: EXPLORE & ARCHITECTURE (Dynamic & crawlable) */}
                <motion.div variants={itemVariants} className="flex flex-col items-start gap-1">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-widest mb-4 text-white/80">Systems & Archive</h3>
                    <div className="flex flex-col items-start gap-2">
                        <Link
                            href="/about"
                            className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1"
                        >
                            About & Dossier ↗
                        </Link>
                        <Link
                            href="/projects"
                            className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1"
                        >
                            Selected Works ↗
                        </Link>
                        {/* Dynamic Projects loaded from database / context */}
                        {data.projects &&
                            data.projects.length > 0 &&
                            data.projects.slice(0, 4).map((project) => (
                                <Link
                                    key={project.slug || project.id}
                                    href={`/projects/${project.slug}`}
                                    className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide text-white/70 hover:text-white hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1 truncate max-w-[220px]"
                                >
                                    {project.title} ↗
                                </Link>
                            ))}
                    </div>
                </motion.div>

                {/* Column 3: CHANNELS */}
                <motion.div variants={itemVariants} className="flex flex-col items-start gap-1">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-widest mb-4 text-white/80">Channels</h3>
                    <div className="flex flex-col items-start gap-2">
                        <a
                            href={data.socials?.portfolio3d || "https://3d.mahdimonir.dev"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1"
                        >
                            3D Portfolio ↗
                        </a>
                        <a
                            href={`mailto:${data.email}`}
                            className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1"
                        >
                            Email ↗
                        </a>
                        {data.socials?.linkedin && (
                            <a
                                href={data.socials.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1"
                            >
                                LinkedIn ↗
                            </a>
                        )}
                        {data.socials?.github && (
                            <a
                                href={data.socials.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1"
                            >
                                GitHub ↗
                            </a>
                        )}
                        {data.socials?.twitter && (
                            <a
                                href={data.socials.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1"
                            >
                                Twitter ↗
                            </a>
                        )}
                    </div>
                </motion.div>

                {/* Column 4: DIRECT CONTACT */}
                <motion.div variants={itemVariants} className="flex flex-col items-start h-full justify-between">
                    <div className="flex flex-col items-start gap-1">
                        <h3 className="font-sans text-xs font-bold uppercase tracking-widest mb-4 text-white/80">Direct Contact</h3>
                        <a
                            href={`mailto:${data.email}`}
                            className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 text-white"
                        >
                            {data.email}
                        </a>
                        {data.location && <p className="font-sans text-xs text-white/40 uppercase tracking-wide mt-1">{data.location}</p>}
                        {data.responseTime && (
                            <p className="font-sans text-xs text-white/30 uppercase tracking-wide mt-2">{data.responseTime}</p>
                        )}
                    </div>

                    <div className="mt-8 md:mt-0">
                        <p className="font-sans text-xs md:text-sm font-bold uppercase tracking-widest text-white/50">
                            © 2026 {data.firstName || "MAHDI"}
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Bottom Section: Branding Text */}
            <motion.div
                style={{ opacity: textOpacity, scale: textScale }}
                className="w-full flex-1 flex flex-col justify-center items-center overflow-hidden select-none pb-4"
            >
                <h1 className="font-sans font-black text-[23vw] leading-[0.8] text-white uppercase tracking-tighter flex items-start">
                    {data.firstName || "MAHDI"}
                    <span className="text-xl md:text-4xl lg:text-6xl font-medium mt-[2vw] ml-1 opacity-60">®</span>
                </h1>
            </motion.div>
        </footer>
    );
};

export default Footer;
