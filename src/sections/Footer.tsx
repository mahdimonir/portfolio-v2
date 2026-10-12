"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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
            {/* Top Section: Info Grid */}
            <motion.div
                className="px-6 md:px-12 lg:px-16 max-w-[1600px] mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-x-12 shrink-0"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {/* Column 1: IDENTIFICATION */}
                <motion.div variants={itemVariants} className="flex flex-col gap-1">
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

                {/* Column 2: CHANNELS */}
                <motion.div variants={itemVariants} className="flex flex-col gap-1">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-widest mb-4 text-white/80">Channels</h3>
                    <div className="flex flex-col gap-2">
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

                {/* Column 3: DIRECT CONTACT */}
                <motion.div variants={itemVariants} className="flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-1">
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
