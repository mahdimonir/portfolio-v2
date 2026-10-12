"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardFormSkeleton } from "@/components/dashboard/DashboardSkeletons";

export default function QuoteDashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/sections?tab=quote");
    }, [router]);

    return <DashboardFormSkeleton title="Hero & Philosophy Quote" />;
}
