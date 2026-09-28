"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactLenis } from "lenis/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ReactLenis
        root
        options={{
          autoRaf: true,
          smoothWheel: true,
          duration: 1.2,
          wheelMultiplier: 0.9,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          syncTouch: true,
          syncTouchLerp: 0.15,
          touchMultiplier: 1.2,
          touchInertiaExponent: 1.55,
        }}
      >
        <Sonner />
        {children}
      </ReactLenis>
    </QueryClientProvider>
  );
}
