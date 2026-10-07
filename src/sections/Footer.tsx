"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import db from "@/lib/portfolio-db.json";

const Footer = () => {
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
    <footer ref={footerRef} className="bg-black text-white font-sans pt-12 md:pt-20 border-t border-white min-h-screen md:h-screen flex flex-col justify-between">

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
          <h3 className="font-sans text-xs font-bold uppercase tracking-widest mb-4 text-white/80">
            Identification
          </h3>
          <p className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide leading-relaxed">
            {db.name}
          </p>
          <p className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide leading-relaxed text-white/60">
            {db.role}
          </p>
          <p className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide leading-relaxed text-white/60">
            {db.location}
          </p>
        </motion.div>

        {/* Column 2: CHANNELS */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1">
          <h3 className="font-sans text-xs font-bold uppercase tracking-widest mb-4 text-white/80">
            Channels
          </h3>
          <div className="flex flex-col gap-2">
            <a
              href={db.socials.portfolio3d || "https://3d.mahdimonir.dev"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1"
            >
              3D Portfolio ↗
            </a>
            <a
              href={`mailto:${db.email}`}
              className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1"
            >
              Email ↗
            </a>
            <a
              href={db.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1"
            >
              LinkedIn ↗
            </a>
            <a
              href={db.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide hover:underline underline-offset-4 decoration-1 w-fit flex items-center gap-1"
            >
              GitHub ↗
            </a>
          </div>
        </motion.div>

        {/* Column 3: AVAILABILITY */}
        <motion.div variants={itemVariants} className="flex flex-col h-full justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest mb-4 text-white/80">
              Availability
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="font-sans text-xs md:text-sm font-medium uppercase tracking-wide text-green-400">
                {db.availability}
              </span>
            </div>
            <p className="font-sans text-xs text-white/40 uppercase tracking-wide">
              {db.responseTime}
            </p>
            <p className="font-sans text-xs text-white/30 uppercase tracking-wide mt-3">
              {db.email}
            </p>
          </div>

          <div className="mt-8 md:mt-0">
            <p className="font-sans text-xs md:text-sm font-bold uppercase tracking-widest text-white/50">
              © 2026 {db.firstName}
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
          {db.firstName}
          <span className="text-xl md:text-4xl lg:text-6xl font-medium mt-[2vw] ml-1 opacity-60">
            ®
          </span>
        </h1>
      </motion.div>
    </footer>
  );
};

export default Footer;
