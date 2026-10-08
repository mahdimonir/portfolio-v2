"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import db from "@/lib/portfolio-db.json";

const About = () => {
  const [vh, setVh] = useState(800);

  useEffect(() => {
    const updateVh = () => setVh(window.innerHeight);
    updateVh();
    window.addEventListener("resize", updateVh);
    return () => window.removeEventListener("resize", updateVh);
  }, []);

  const { scrollY } = useScroll();

  const y1 = useTransform(scrollY, [0, vh * 0.4], [80, 0]);
  const opacity1 = useTransform(scrollY, [0, vh * 0.3], [0, 1]);

  const y2 = useTransform(scrollY, [vh * 0.08, vh * 0.45], [80, 0]);
  const opacity2 = useTransform(scrollY, [vh * 0.08, vh * 0.38], [0, 1]);

  const y3 = useTransform(scrollY, [vh * 0.18, vh * 0.55], [80, 0]);
  const opacity3 = useTransform(scrollY, [vh * 0.18, vh * 0.48], [0, 1]);

  const y4 = useTransform(scrollY, [vh * 0.28, vh * 0.65], [80, 0]);
  const opacity4 = useTransform(scrollY, [vh * 0.28, vh * 0.58], [0, 1]);

  // Latest education entry (BSc, On Going)
  const latestEdu = db.about.education[0];
  // Latest (current) job
  const currentJob = db.about.experience.find((e) => e.current && e.companyUrl);
  // Most recent past job
  const recentJob = db.about.experience.find((e) => !e.current && e.companyUrl);

  return (
    <section className="h-screen w-full bg-white text-black font-sans px-6 md:px-12 lg:px-16 overflow-hidden flex items-center justify-center relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-x-12 w-full max-w-[1600px] mx-auto">

        {/* Left Column: Context Label */}
        <motion.div
          className="md:col-span-3 lg:col-span-3 pt-2"
          style={{ y: y1, opacity: opacity1 }}
        >
          <h2 className="font-sans text-xs md:text-sm font-bold uppercase tracking-widest">
            {db.about.label}
          </h2>
        </motion.div>

        {/* Right Column: The Data List */}
        <div className="md:col-span-9 lg:col-span-9 flex flex-col gap-5 sm:gap-7 md:gap-10">

          {/* 01. EDUCATION */}
          <motion.div style={{ y: y2, opacity: opacity2 }} className="flex flex-col gap-1 sm:gap-2">
            <h3 className="font-sans text-xs md:text-sm font-bold uppercase tracking-wide opacity-100 mb-0.5 sm:mb-1">
              01. Education
            </h3>
            <div className="flex flex-col gap-0.5 sm:gap-1">
              <p className="font-sans text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-tight">
                {latestEdu.institution}
              </p>
              <p className="font-sans text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-black/70 leading-tight tracking-tight">
                {latestEdu.degree}
                <span className="ml-3 text-sm font-mono font-medium text-black/40 tracking-widest uppercase">
                  {latestEdu.period}
                </span>
              </p>
            </div>
          </motion.div>

          {/* 02. EXPERIENCE */}
          <motion.div style={{ y: y3, opacity: opacity3 }} className="flex flex-col gap-2">
            <h3 className="font-sans text-xs md:text-sm font-bold uppercase tracking-wide opacity-100 mb-1">
              02. Experience
            </h3>
            <div className="flex flex-col gap-4">
              {/* Current role */}
              {currentJob && (
                <div>
                  <div className="flex items-baseline gap-3">
                    <p className="font-sans text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-tight">
                      {currentJob.company}
                    </p>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] px-2 py-0.5 bg-black text-white">
                      CURRENT
                    </span>
                  </div>
                  <p className="font-sans text-xl md:text-2xl lg:text-3xl font-normal text-black/70 leading-tight tracking-tight">
                    {currentJob.role}
                    <span className="ml-3 text-sm font-mono font-medium text-black/40 tracking-widest uppercase">
                      {currentJob.period}
                    </span>
                  </p>
                </div>
              )}
              {/* Previous role */}
              {recentJob && (
                <div>
                  <p className="font-sans text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-black/70">
                    {recentJob.company}
                  </p>
                  <p className="font-sans text-xl md:text-2xl lg:text-3xl font-normal text-black/40 leading-tight tracking-tight">
                    {recentJob.role}
                    <span className="ml-3 text-sm font-mono font-medium text-black/30 tracking-widest uppercase">
                      {recentJob.period}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* 03. FOCUS */}
          <motion.div style={{ y: y4, opacity: opacity4 }} className="flex flex-col gap-2">
            <h3 className="font-sans text-xs md:text-sm font-bold uppercase tracking-wide opacity-100 mb-1">
              03. Focus
            </h3>
            <ul className="flex flex-col">
              {db.about.focus.map((item) => (
                <li key={item} className="font-sans text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-tight">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
