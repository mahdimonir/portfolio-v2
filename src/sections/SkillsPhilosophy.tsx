"use client";

import { motion } from "framer-motion";
import FlowingMenu from "@/components/FlowingMenu";
import db from "@/lib/portfolio-db.json";

const skillCategories = db.skills.map((cat) => ({
  link: "#",
  text: cat.category,
  items: cat.items,
}));

const SkillsPhilosophy = () => {
  return (
    // Unified layout using justify-center on all breakpoints to keep elements seamlessly grouped
    <section className="min-h-screen bg-white text-black font-sans flex flex-col justify-center">
      <div className="w-full px-6 md:px-12 lg:px-16 pt-24 pb-12 md:pt-12 md:pb-12 bg-white z-10 md:flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-y-8"
        >
          <div className="md:col-span-1">
            <h2 className="text-xs font-bold uppercase tracking-widest">Skills & Philosophy</h2>
          </div>
          <div className="md:col-span-4">
            <blockquote className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase leading-tight">
              "{db.quote.text}"
            </blockquote>
            <p className="mt-6">— {db.quote.author}</p>
          </div>
        </motion.div>
      </div>

      <div className="w-full border-t border-black relative overflow-hidden">
        <FlowingMenu
          items={skillCategories}
          speed={3}
          marqueeBgColor="#000000"
        />
      </div>
    </section>
  );
};

export default SkillsPhilosophy;
