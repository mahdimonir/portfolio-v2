"use client";

import React from "react";

/**
 * Modern skeleton placeholder for Dashboard Overview (/dashboard)
 */
export function DashboardOverviewSkeleton() {
    return (
        <div className="w-full flex flex-col gap-6 animate-pulse">
            {/* Top Identity Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/70 shrink-0" />
                    <div className="space-y-2">
                        <div className="h-5 w-44 bg-zinc-800/80 rounded" />
                        <div className="h-3 w-32 bg-zinc-800/50 rounded" />
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-36 bg-zinc-800/60 rounded-lg" />
                    <div className="h-8 w-24 bg-zinc-800/70 rounded-lg" />
                </div>
            </div>

            {/* 4 Metric Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between h-28"
                    >
                        <div className="flex items-center justify-between">
                            <div className="h-3 w-20 bg-zinc-800/80 rounded" />
                            <div className="h-3 w-8 bg-zinc-800/50 rounded" />
                        </div>
                        <div className="space-y-2 mt-2">
                            <div className="h-7 w-16 bg-zinc-800 rounded" />
                            <div className="h-1.5 w-full bg-zinc-800/60 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Split: Left (Inbox/Activity) + Right (Quick Actions) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-4 w-36 bg-zinc-800 rounded" />
                        <div className="h-4 w-20 bg-zinc-800/60 rounded" />
                    </div>
                    <div className="space-y-3 pt-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-16 bg-zinc-900/70 border border-zinc-800/60 rounded-lg p-3 flex items-center justify-between"
                            >
                                <div className="space-y-2">
                                    <div className="h-3.5 w-44 bg-zinc-800 rounded" />
                                    <div className="h-2.5 w-28 bg-zinc-800/50 rounded" />
                                </div>
                                <div className="h-6 w-16 bg-zinc-800/60 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 space-y-4">
                        <div className="h-4 w-28 bg-zinc-800 rounded" />
                        <div className="space-y-3">
                            <div className="h-12 bg-zinc-900/80 border border-zinc-800/60 rounded-lg" />
                            <div className="h-12 bg-zinc-900/80 border border-zinc-800/60 rounded-lg" />
                            <div className="h-12 bg-zinc-900/80 border border-zinc-800/60 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Modern skeleton placeholder for Projects Catalog (/dashboard/projects)
 */
export function ProjectsCatalogSkeleton() {
    return (
        <div className="w-full flex flex-col gap-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                <div className="space-y-2">
                    <div className="h-6 w-48 bg-zinc-800/90 rounded" />
                    <div className="h-3 w-64 bg-zinc-800/50 rounded" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-9 w-28 bg-zinc-800/70 rounded-lg" />
                    <div className="h-9 w-32 bg-zinc-800 rounded-lg" />
                </div>
            </div>

            {/* Filter and Search Bar Skeleton */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="h-10 flex-1 w-full bg-zinc-900/50 border border-zinc-800 rounded-lg" />
                <div className="h-10 w-32 bg-zinc-900/50 border border-zinc-800 rounded-lg" />
            </div>

            {/* Project Cards Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl overflow-hidden flex flex-col h-72"
                    >
                        <div className="h-36 bg-zinc-800/60 w-full" />
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                                <div className="h-3 w-full bg-zinc-800/50 rounded" />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <div className="h-3 w-16 bg-zinc-800/60 rounded" />
                                <div className="h-6 w-20 bg-zinc-800/70 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Modern skeleton placeholder for Form Editing pages (Profile, About, Skills, Quote)
 */
export function DashboardFormSkeleton({ title = "Editor" }: { title?: string }) {
    return (
        <div className="w-full flex flex-col gap-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                <div className="space-y-2">
                    <div className="h-6 w-44 bg-zinc-800/90 rounded" />
                    <div className="h-3 w-60 bg-zinc-800/50 rounded" />
                </div>
                <div className="h-9 w-28 bg-zinc-800/80 rounded-lg" />
            </div>

            {/* Form Fields Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3.5 w-28 bg-zinc-800/70 rounded" />
                            <div className="h-10 w-full bg-zinc-900/80 border border-zinc-800/70 rounded-lg" />
                        </div>
                    ))}
                    <div className="space-y-2 pt-2">
                        <div className="h-3.5 w-36 bg-zinc-800/70 rounded" />
                        <div className="h-28 w-full bg-zinc-900/80 border border-zinc-800/70 rounded-lg" />
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 space-y-4">
                        <div className="h-4 w-32 bg-zinc-800 rounded" />
                        <div className="h-36 w-full bg-zinc-900/80 border border-zinc-800/60 rounded-lg" />
                        <div className="h-8 w-full bg-zinc-800/60 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Modern skeleton placeholder for Inquiries Inbox (/dashboard/inquiries)
 */
export function DashboardInquiriesSkeleton() {
    return (
        <div className="w-full flex flex-col gap-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                <div className="space-y-2">
                    <div className="h-6 w-44 bg-zinc-800/90 rounded" />
                    <div className="h-3 w-56 bg-zinc-800/50 rounded" />
                </div>
                <div className="h-9 w-28 bg-zinc-800/80 rounded-lg" />
            </div>

            {/* Inquiries List Skeleton */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl divide-y divide-zinc-800/60 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 flex-1">
                            <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-40 bg-zinc-800 rounded" />
                                <div className="h-3 w-72 bg-zinc-800/50 rounded" />
                            </div>
                        </div>
                        <div className="h-3 w-16 bg-zinc-800/40 rounded shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}
