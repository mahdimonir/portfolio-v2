"use client";

import React from "react";
import FlowingMenu from "@/components/FlowingMenu";
import Quote from "@/sections/Quote";
import { usePortfolioData } from "@/lib/PortfolioContext";

const SkillsPhilosophy = () => {
  const data = usePortfolioData();
  const skillCategories = (data.skills || []).map((cat) => ({
    link: "#",
    text: cat.category,
    items: cat.items,
  }));

  return (
    // Unified layout using justify-center on all breakpoints to keep elements seamlessly grouped
    <section className="min-h-screen bg-white text-black font-sans flex flex-col justify-center">
      <div className="w-full px-6 md:px-12 lg:px-16 pt-24 pb-12 md:pt-12 md:pb-12 bg-white z-10 md:flex-shrink-0">
        <Quote />
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
