"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardFormSkeleton } from "@/components/dashboard/DashboardSkeletons";

export default function ProfileDashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/about?tab=identity");
    }, [router]);

    return <DashboardFormSkeleton title="Profile & Identity" />;
}
