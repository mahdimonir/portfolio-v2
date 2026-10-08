"use client";

import { motion, useSpring, useMotionValue, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import db from "@/lib/portfolio-db.json";

// Components
import About from "./About";
import SplashCursor from "@/components/SplashCursor";
import SelectedWorks from "./SelectedWorks";
import VectorBridge from "./VectorBridge";
import Footer from "./Footer";
import Contact from "./Contact";
import Testimonial from "./Testimonial";
import Navigation from "@/components/Navigation";
import { useEffect, useRef } from "react";

// --- Cursor Follower ---
const CursorFollower = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 20, stiffness: 100, mass: 0.8 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX - 12);
            mouseY.set(e.clientY - 12);
        };
        window.addEventListener("mousemove", moveCursor);
        return () => window.removeEventListener("mousemove", moveCursor);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            className="fixed top-0 left-0 w-6 h-6 bg-gray-400/50 rounded-full pointer-events-none z-[9999] hidden lg:block backdrop-blur-[1px]"
            style={{ x, y }}
        />
    );
};

const BrandLogo = () => (
    <div className="fixed top-6 left-6 md:top-8 md:left-10 z-50 mix-blend-difference">
        <h1 className="font-sans font-black text-2xl md:text-4xl tracking-tighter text-white flex items-start">
            {db.firstName}
            <span className="text-xs md:text-lg font-medium ml-1 -mt-1 md:-mt-2">®</span>
        </h1>
    </div>
);

const SocialStrip = () => {
    const socials = [
        { label: "3D Portfolio", href: db.socials.portfolio3d || "https://3d.mahdimonir.dev" },
        { label: "GitHub", href: db.socials.github },
        { label: "LinkedIn", href: db.socials.linkedin },
        { label: "Twitter", href: db.socials.twitter },
        { label: "Email", href: `mailto:${db.email}` },
    ];
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute z-20 hidden md:flex flex-col items-center"
            style={{ right: "64px", top: "112px", bottom: "194px", justifyContent: "center", gap: "1rem" }}
        >
            <span className="w-[1px] h-8 bg-white/30 flex-shrink-0" />
            {socials.map(({ label, href }) => (
                <a
                    key={label}
                    href={href}
                    target={href.startsWith("mailto") ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    title={label}
                    className="group flex-shrink-0"
                    style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                >
                    <span className="font-sans font-black text-[10px] tracking-[0.22em] uppercase text-white group-hover:opacity-100 transition-opacity duration-300">
                        {label}
                    </span>
                </a>
            ))}
            <span className="w-[1px] h-8 bg-white/30 flex-shrink-0" />
        </motion.div>
    );
};

const SpinningCTA = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute md:z-30 lg:z-10 hidden md:flex items-center justify-center"
        style={{ bottom: "4rem", right: "4rem" }}
    >
        <style>{`
      @keyframes ctaSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .cta-ring { animation: ctaSpin var(--cta-spin-duration, 10s) linear infinite; transform-origin: center; }
      .cta-wrap:hover .cta-ring { --cta-spin-duration: 3s; }
      .cta-wrap { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      .cta-wrap:hover { transform: scale(1.08); }
    `}</style>
        <a
            href="#contact"
            className="cta-wrap group relative flex items-center justify-center w-[130px] h-[130px]"
            aria-label="Get in touch"
        >
            <svg viewBox="0 0 130 130" className="absolute inset-0 w-full h-full pointer-events-none">
                <circle cx="65" cy="65" r="62" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            </svg>
            <svg viewBox="0 0 130 130" className="cta-ring absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <path id="cta-circle-path" d="M65,65 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
                </defs>
                <text fill="rgba(255,255,255,1)" fontSize="8.5" fontFamily="'Inter', sans-serif" fontWeight="900" letterSpacing="4">
                    <textPath href="#cta-circle-path">GET IN TOUCH · GET IN TOUCH · GET IN TOUCH ·&nbsp;</textPath>
                </text>
            </svg>
            <span
                className="absolute inset-4 rounded-full bg-white scale-0 group-hover:scale-100 transition-transform duration-500 ease-in-out"
                style={{ transformOrigin: "center" }}
            />
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="relative z-10 w-6 h-6 text-white group-hover:text-black"
                style={{ transition: "color 0.3s ease" }}
            >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
        </a>
    </motion.div>
);

const MobileSocialStrip = () => {
    const socials = [
        {
            label: "3D Portfolio",
            href: db.socials.portfolio3d || "https://3d.mahdimonir.dev",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px]">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
            ),
        },
        {
            label: "Github",
            href: db.socials.github,
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
            ),
        },
        {
            label: "LinkedIn",
            href: db.socials.linkedin,
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
            ),
        },
        {
            label: "Twitter",
            href: db.socials.twitter,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px]">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
            ),
        },
        {
            label: "Email",
            href: `mailto:${db.email}`,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px]">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
            ),
        },
    ];
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
        >
            {socials.map(({ label, icon, href }) => (
                <a
                    key={label}
                    href={href}
                    target={href.startsWith("mailto") ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-white hover:opacity-75 transition-opacity duration-300 block"
                >
                    {icon}
                </a>
            ))}
        </motion.div>
    );
};

const Index = () => {
    const footerContainerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: footerContainerRef,
        offset: ["start end", "end end"],
    });

    // Create parallax effect: Footer starts higher up and moves to normal position as we scroll into it
    const footerY = useTransform(scrollYProgress, [0, 1], ["-50%", "0%"]);

    return (
        <div className="min-h-screen relative bg-black selection:bg-white selection:text-black">
            <BrandLogo />
            <CursorFollower />
            <Navigation />

            {/* Fixed background About section */}
            <div className="fixed inset-0 z-0 bg-white text-black">
                <About />
            </div>

            {/* Hero */}
            <section className="relative h-screen bg-black flex flex-col px-6 py-12 md:px-16 md:py-16 z-20 overflow-hidden">
                <SocialStrip />
                <SpinningCTA />
                <div className="hidden lg:block">
                    <SplashCursor />
                </div>
                {/* Mobile Midpoint Buffer: 80px total height from top to clear hamburger (Hamburger at 24px + 56px height) */}
                <div className="h-[32px] w-full md:hidden" /> {/* py-12 (48px) + 32px = 80px */}
                {/* Dynamic Centering Container for Mobile Socials */}
                <div className="flex-1 flex flex-col items-end justify-center md:hidden pr-0 z-10 pointer-events-none">
                    <div className="pointer-events-auto">
                        <MobileSocialStrip />
                    </div>
                </div>
                {/* Left Side Content from Final Test Design */}
                <div className="z-10 mt-auto mb-6 md:mb-10 max-w-4xl">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        {/* 1st Line: MAHDI */}
                        <h1 className="font-sans font-black text-6xl sm:text-7xl md:text-8xl lg:text-[8.5rem] xl:text-[10.5rem] leading-[0.84] tracking-tighter text-white uppercase text-left select-none">
                            MAHDI
                        </h1>
                    </motion.div>

                    {/* 2nd Line: Position small text directly beneath MAHDI */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="mt-3 md:mt-5 flex flex-wrap items-center gap-3"
                    >
                        <span className="h-[2px] w-6 md:w-8 bg-cyan-400 hidden sm:block" />
                        <h2 className="font-mono text-xs sm:text-sm md:text-base lg:text-lg uppercase tracking-[0.25em] text-zinc-200 font-bold">
                            {db.role || "Full Stack Developer"}
                        </h2>
                    </motion.div>

                    {/* Bio text directly underneath */}
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.35 }}
                        className="mt-4 md:mt-5 font-sans text-xs sm:text-sm md:text-base text-zinc-400 font-normal leading-relaxed max-w-xl"
                    >
                        {db.hero.subheadline}
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.45 }}
                        className="mt-6 md:mt-8 flex flex-wrap items-center gap-4 sm:gap-6"
                    >
                        <a
                            href="#contact"
                            className="group relative inline-flex items-center gap-3 px-6 py-3.5 border border-white/20 bg-white/5 hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm shadow-lg"
                        >
                            <span className="font-mono font-bold text-xs tracking-[0.2em] uppercase text-white group-hover:text-black transition-colors duration-300">
                                Initiate Contact
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" />
                        </a>
                        <a
                            href="#work"
                            className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors duration-300 flex items-center gap-2"
                        >
                            Selected Works
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Content stack */}
            <div className="relative z-20 w-full bg-transparent">
                <div id="about" className="h-screen w-full pointer-events-none" />

                <div id="work" className="bg-black text-white relative z-20">
                    <SelectedWorks />
                </div>

                <div className="bg-white text-black relative z-20">
                    <VectorBridge />
                </div>

                <div className="bg-black text-white relative z-20">
                    <Testimonial />
                </div>

                {/* Change contact layer to z-20 and relative so it scrolls normally OVER the footer */}
                <div id="contact" className="relative z-20 bg-white text-black">
                    <Contact />
                </div>
            </div>

            {/* Parallax Footer Reveal Stack */}
            <div ref={footerContainerRef} className="relative z-0 h-screen w-full overflow-hidden bg-black text-white">
                <motion.div style={{ y: footerY }} className="h-full w-full">
                    <Footer />
                </motion.div>
            </div>
        </div>
    );
};

export default Index;
