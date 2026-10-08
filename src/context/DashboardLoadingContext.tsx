"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface DashboardLoadingContextType {
    isLoading: boolean;
    statusText: string | null;
    lastSaved: Date | null;
    startLoading: (status?: string) => void;
    stopLoading: () => void;
    withLoading: <T>(action: () => Promise<T>, status?: string) => Promise<T>;
    setStatusText: (status: string | null) => void;
}

const DashboardLoadingContext = createContext<DashboardLoadingContextType>({
    isLoading: false,
    statusText: null,
    lastSaved: null,
    startLoading: () => {},
    stopLoading: () => {},
    withLoading: async (action) => action(),
    setStatusText: () => {},
});

export const useDashboardLoading = () => useContext(DashboardLoadingContext);

export function DashboardLoadingProvider({ children }: { children: React.ReactNode }) {
    const [activeCount, setActiveCount] = useState(0);
    const [statusText, setStatusText] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isLoading = activeCount > 0;

    const startLoading = useCallback((status?: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setActiveCount((prev) => prev + 1);
        if (status) {
            setStatusText(status);
        } else {
            setStatusText((prev) => prev || "Syncing with database...");
        }
    }, []);

    const stopLoading = useCallback(() => {
        setActiveCount((prev) => {
            const next = Math.max(0, prev - 1);
            if (next === 0) {
                setLastSaved(new Date());
                // Keep the "Saved" status visible for a brief moment before fading
                timeoutRef.current = setTimeout(() => {
                    setStatusText(null);
                }, 2500);
            }
            return next;
        });
    }, []);

    const withLoading = useCallback(
        async <T,>(action: () => Promise<T>, status?: string): Promise<T> => {
            startLoading(status);
            try {
                return await action();
            } finally {
                stopLoading();
            }
        },
        [startLoading, stopLoading]
    );

    // Global fetch interception for dashboard API mutations (POST, PUT, PATCH, DELETE)
    useEffect(() => {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [resource, config] = args;
            const method = (config?.method || "GET").toUpperCase();
            const urlStr = typeof resource === "string" ? resource : (resource as Request)?.url || "";

            const isDashboardApi = urlStr.includes("/api/") && !urlStr.includes("/api/auth/verify");
            const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

            if (isDashboardApi && isMutation) {
                let label = "Saving changes...";
                if (method === "DELETE") label = "Deleting item...";
                if (urlStr.includes("reorder")) label = "Reordering catalog...";
                if (urlStr.includes("upload")) label = "Uploading asset...";

                startLoading(label);
                try {
                    return await originalFetch(...args);
                } finally {
                    stopLoading();
                }
            }

            return originalFetch(...args);
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, [startLoading, stopLoading]);

    return (
        <DashboardLoadingContext.Provider
            value={{
                isLoading,
                statusText,
                lastSaved,
                startLoading,
                stopLoading,
                withLoading,
                setStatusText,
            }}
        >
            {/* Top Linear Progress Indicator Strip */}
            <div
                className={`fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none transition-opacity duration-300 ${
                    isLoading ? "opacity-100" : "opacity-0"
                }`}
            >
                <div className="relative w-full h-full overflow-hidden bg-black/40">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 animate-shimmer" />
                    <div
                        className="absolute inset-0 bg-white/30 animate-pulse"
                        style={{
                            boxShadow: "0 0 10px rgba(34, 211, 238, 0.8), 0 0 20px rgba(99, 102, 241, 0.6)",
                        }}
                    />
                </div>
            </div>

            {children}
        </DashboardLoadingContext.Provider>
    );
}
