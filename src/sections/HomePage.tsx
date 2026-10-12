"use client";

import { motion, useSpring, useMotionValue, useScroll, useTransform } from "framer-motion";
import { usePortfolioData } from "@/lib/PortfolioContext";
import { useEffect, useRef } from "react";

// Sections
import Hero from "./Hero";
import About from "./About";
import SelectedWorks from "./SelectedWorks";
import VectorBridge from "./VectorBridge";
import Testimonial from "./Testimonial";
import Contact from "./Contact";
import Footer from "./Footer";
import Navigation from "@/components/Navigation";

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

const BrandLogo = () => {
    const data = usePortfolioData();
    return (
        <div className="fixed top-6 left-6 md:top-8 md:left-10 z-50 mix-blend-difference">
            <h1 className="font-sans font-black text-2xl md:text-4xl tracking-tighter text-white flex items-start">
                {data.firstName || "MAHDI"}
                <span className="text-xs md:text-lg font-medium ml-1 -mt-1 md:-mt-2">®</span>
            </h1>
        </div>
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
            <div className="fixed inset-0 z-0 bg-white text-black pointer-events-auto">
                <About />
            </div>

            {/* Hero Section */}
            <Hero />

            {/* Content stack - pointer-events-none allows clicks to pass through to About, children have pointer-events-auto */}
            <div className="relative z-20 w-full bg-transparent pointer-events-none">
                <div id="about" className="h-screen w-full pointer-events-none" />

                <div id="work" className="bg-black text-white relative z-20 pointer-events-auto">
                    <SelectedWorks />
                </div>

                <div className="bg-white text-black relative z-20 pointer-events-auto">
                    <VectorBridge />
                </div>

                <div className="bg-black text-white relative z-20 pointer-events-auto">
                    <Testimonial />
                </div>

                {/* Change contact layer to z-20 and relative so it scrolls normally OVER the footer */}
                <div id="contact" className="relative z-20 bg-white text-black pointer-events-auto">
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
