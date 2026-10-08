"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When route changes, complete the progress bar
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const hideTimeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350);
      return () => clearTimeout(hideTimeout);
    }
  }, [pathname, searchParams]);

  // Global click listener to detect navigation clicks on internal links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel, anchor hashes, download links, or new tabs
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if navigating to the same URL
      const currentPath = window.location.pathname;
      if (href === currentPath || href === window.location.pathname + window.location.search) {
        return;
      }

      // Do not duplicate if navigating inside dashboard (dashboard has its own context)
      if (currentPath.startsWith("/dashboard") && href.startsWith("/dashboard")) {
        return;
      }

      // Start top loading progress
      setVisible(true);
      setProgress(25);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) {
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + Math.floor(Math.random() * 12) + 6;
        });
      }, 150);
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-300 transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          boxShadow: "0 0 10px rgba(34, 211, 238, 0.8), 0 0 20px rgba(99, 102, 241, 0.5)",
        }}
      />
    </div>
  );
}

export default function PublicLoadingBar() {
  return (
    <Suspense fallback={null}>
      <ProgressIndicator />
    </Suspense>
  );
}
