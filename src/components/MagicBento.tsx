"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { usePortfolioData } from "@/lib/PortfolioContext";

const MagicBento = () => {
  const data = usePortfolioData();

  const { projectsCount, yearsExperience, engineeringHours } = useMemo(() => {
    // 1. Projects count from actual database projects
    const pCount = Array.isArray(data?.projects) && data.projects.length > 0 ? data.projects.length : 12;

    // 2. Years experience calculated from real career history in DB
    let earliestYear = 2023;
    if (Array.isArray(data?.about?.experience)) {
      data.about.experience.forEach((exp) => {
        const matches = exp.period?.match(/\b(20\d\d)\b/g);
        if (matches) {
          matches.forEach((y) => {
            const num = parseInt(y, 10);
            if (num >= 2015 && num < earliestYear) earliestYear = num;
          });
        }
      });
    }
    const currentYear = new Date().getFullYear();
    const calculatedYears = Math.max(3, currentYear - earliestYear);

    // 3. Engineering Hours: based on project count and engineering track record
    const calculatedHours = Math.max(1200, pCount * 90 + calculatedYears * 250);

    const stats = (data as unknown as { stats?: { projects?: number; years?: number; hours?: number } })?.stats;

    return {
      projectsCount: stats?.projects ?? pCount,
      yearsExperience: stats?.years ?? calculatedYears,
      engineeringHours: stats?.hours ?? calculatedHours,
    };
  }, [data]);

  return (
    <section className="w-full bg-black text-white py-32">
      <div className="mx-auto max-w-7xl px-6">

        {/* Section Header */}
        <div className="mb-24">
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em]">
            More About Me
          </h2>
        </div>

        {/* Strict Swiss Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-40">

          <SwissItem
            value={projectsCount}
            suffix="+"
            label="Projects Completed"
            description="Completed multiple projects from concept to final implementation."
          />

          <SwissItem
            value={yearsExperience}
            suffix="+"
            label="Years Experience"
            description="Building software with architectural intent and predictable system behavior."
          />

          <SwissItem
            value={engineeringHours}
            suffix="+"
            label="Engineering Hours"
            description="Engineering judgment refined through real-world constraints."
          />

          <SwissItem
            value={1}
            suffix="st"
            label="Systems First"
            description="Architecture precedes interface. Structure defines outcome."
          />

        </div>
      </div>
    </section>
  );
};

interface SwissItemProps {
  value: number;
  suffix: string;
  label: string;
  description: string;
}

const SwissItem = ({ value, suffix, label, description }: SwissItemProps) => {
  const [count, setCount] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (value && !hasAnimated.current) {
      setCount(value);
    }
  }, [value]);

  useEffect(() => {
    if (!value) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1200;
          const startTime = performance.now();

          const update = (time: number) => {
            const progress = Math.min((time - startTime) / duration, 1);
            setCount(Math.floor(progress * value));

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              setCount(value);
            }
          };

          requestAnimationFrame(update);
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col items-start">

      {/* Label */}
      <span className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-white">
        {label}
      </span>

      {/* Number */}
      <h3 className="mb-6 font-sans text-8xl md:text-9xl font-bold tracking-tight leading-none">
        {(count ?? value).toLocaleString()}
        {suffix}
      </h3>

      {/* Description */}
      <p className="max-w-sm font-sans text-base leading-6 text-white/65">
        {description}
      </p>
    </div>
  );
};

export default MagicBento;
