"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    LayoutDashboard,
    User,
    FileText,
    FolderKanban,
    Cpu,
    Quote,
    MessageSquare,
    ExternalLink,
    LogOut,
    Menu,
    X,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronRight,
} from "lucide-react";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const [authChecked, setAuthChecked] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [projectCount, setProjectCount] = useState<number>(0);
    const [userName, setUserName] = useState<string>("STUDIO");

    // 1. Session verification
    useEffect(() => {
        fetch("/api/auth/verify", { credentials: "include" })
            .then((res) => {
                if (!res.ok) {
                    router.push("/login");
                } else {
                    setAuthChecked(true);
                }
            })
            .catch(() => router.push("/login"));
    }, [router]);

    // Restore saved sidebar collapsed preference
    useEffect(() => {
        try {
            const saved = localStorage.getItem("portfolio_sidebar_collapsed");
            if (saved !== null) {
                setCollapsed(saved === "true");
            }
        } catch {}
    }, []);

    const toggleCollapse = useCallback(() => {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem("portfolio_sidebar_collapsed", String(next));
            } catch {}
            return next;
        });
    }, []);

    // Keyboard shortcut (Ctrl+B / Cmd+B) to toggle sidebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
                e.preventDefault();
                toggleCollapse();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleCollapse]);

    // 2. Load basic counts for sidebar badges
    const loadSidebarData = useCallback(() => {
        // Fetch inquiries for unread count
        fetch("/api/contact", { credentials: "include" })
            .then((r) => r.json())
            .then((msgs) => {
                if (Array.isArray(msgs)) {
                    const unread = msgs.filter((m: { read: boolean }) => !m.read).length;
                    setUnreadCount(unread);
                }
            })
            .catch(() => {});

        // Fetch portfolio for user name & project count
        fetch("/api/portfolio")
            .then((r) => r.json())
            .then((data) => {
                if (data?.firstName) setUserName(data.firstName.toUpperCase());
                if (Array.isArray(data?.projects)) setProjectCount(data.projects.length);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (authChecked) {
            loadSidebarData();
        }
    }, [authChecked, loadSidebarData]);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            toast.info("Logged out successfully");
            router.push("/login");
        } catch {
            router.push("/login");
        }
    };

    const navItems: NavItem[] = [
        {
            href: "/dashboard",
            label: "Overview",
            icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
            href: "/dashboard/projects",
            label: "Projects & Works",
            icon: <FolderKanban className="w-4 h-4" />,
            badge: projectCount || undefined,
        },
        {
            href: "/dashboard/about",
            label: "About & Career",
            icon: <FileText className="w-4 h-4" />,
        },
        {
            href: "/dashboard/skills",
            label: "Tech & Stacks",
            icon: <Cpu className="w-4 h-4" />,
        },
        {
            href: "/dashboard/profile",
            label: "Profile & Hero",
            icon: <User className="w-4 h-4" />,
        },
        {
            href: "/dashboard/quote",
            label: "Quote & Philosophy",
            icon: <Quote className="w-4 h-4" />,
        },
        {
            href: "/dashboard/inquiries",
            label: "Inquiries Inbox",
            icon: <MessageSquare className="w-4 h-4" />,
            badge: unreadCount > 0 ? unreadCount : undefined,
            badgeColor: "bg-amber-400 text-black font-bold",
        },
    ];

    // Compute breadcrumb title
    const currentNav =
        navItems.find((item) => {
            if (item.href === "/dashboard") return pathname === "/dashboard";
            return pathname.startsWith(item.href);
        }) || navItems[0];

    if (!authChecked) {
        return (
            <div className="min-h-screen bg-[#09090b] text-zinc-400 flex flex-col items-center justify-center gap-3 font-sans">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">Authenticating Session...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-white selection:text-black">
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
                />
            )}

            {/* Fixed Desktop & Mobile Slideout Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 h-screen bg-[#09090b] border-r border-zinc-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
                    // Mobile slideout drawer
                    mobileOpen ? "translate-x-0 w-72" : "-translate-x-full"
                } md:translate-x-0 md:z-40 ${
                    // Desktop fixed width & overflow:
                    collapsed ? "md:w-20 md:overflow-visible" : "md:w-64 md:overflow-hidden"
                }`}
            >
                {/* Upper Section: Brand & Navigation */}
                <div
                    className={`flex flex-col flex-1 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                        collapsed ? "md:overflow-visible" : "overflow-y-auto"
                    }`}
                >
                    {/* Header: Logo and Mobile Close */}
                    <div
                        className={`p-4 border-b border-zinc-800/80 flex items-center flex-shrink-0 ${
                            collapsed ? "md:justify-center md:px-2" : "justify-between"
                        }`}
                    >
                        {!collapsed ? (
                            <div className="flex items-center justify-between w-full">
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileOpen(false)}
                                    className="font-black text-base tracking-tight uppercase text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                    <span className="w-7 h-7 rounded-lg bg-white text-black font-mono font-black flex items-center justify-center text-xs shadow-sm">
                                        {userName ? userName[0] : "S"}
                                    </span>
                                    <span className="truncate">{userName}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-medium">
                                        STUDIO
                                    </span>
                                </Link>

                                {/* Mobile Close Button */}
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                                    aria-label="Close Navigation"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center justify-center w-full py-1">
                                <Link
                                    href="/dashboard"
                                    className="w-8 h-8 rounded-lg bg-white text-black font-mono font-black flex items-center justify-center text-sm shadow-sm hover:scale-105 transition-transform"
                                    title={`${userName} STUDIO`}
                                >
                                    {userName ? userName[0] : "S"}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Section Header */}
                    {collapsed && <div className="hidden md:block my-2 border-b border-zinc-800/60 mx-4" />}

                    {/* Nav Links */}
                    <nav className={`flex flex-col gap-1.5 py-2 ${collapsed ? "md:px-2 px-3 md:overflow-visible" : "px-3"}`}>
                        {navItems.map((item) => {
                            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);

                            if (collapsed) {
                                return (
                                    <React.Fragment key={item.href}>
                                        {/* Desktop Collapsed View: Icon only with tooltip */}
                                        <Link
                                            href={item.href}
                                            title={item.label}
                                            className={`hidden md:flex relative group items-center justify-center w-12 h-11 mx-auto rounded-xl transition-all ${
                                                isActive
                                                    ? "bg-white text-black shadow-md font-bold"
                                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/90"
                                            }`}
                                        >
                                            <span className={isActive ? "text-black" : "text-zinc-400 group-hover:text-zinc-200"}>
                                                {item.icon}
                                            </span>

                                            {/* Collapsed Badge Indicator */}
                                            {item.badge !== undefined && (
                                                <span
                                                    className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-mono font-bold flex items-center justify-center shadow-md ${
                                                        item.badgeColor
                                                            ? item.badgeColor
                                                            : isActive
                                                              ? "bg-black text-white"
                                                              : "bg-white text-black"
                                                    }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}

                                            {/* Hover Floating Tooltip */}
                                            <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-900/95 border border-zinc-700/80 text-white text-[11px] font-semibold uppercase tracking-wider rounded-lg whitespace-nowrap shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none flex items-center gap-2">
                                                <span>{item.label}</span>
                                                {item.badge !== undefined && (
                                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Mobile Drawer View (full label) */}
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`md:hidden w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                                                isActive
                                                    ? "bg-white text-black shadow-sm font-bold"
                                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={isActive ? "text-black" : "text-zinc-400"}>{item.icon}</span>
                                                <span>{item.label}</span>
                                            </div>
                                            {item.badge !== undefined && (
                                                <span
                                                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                                                        item.badgeColor
                                                            ? item.badgeColor
                                                            : isActive
                                                              ? "bg-black text-white"
                                                              : "bg-zinc-800 text-zinc-400"
                                                    }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </React.Fragment>
                                );
                            }

                            // Desktop & Mobile Expanded View
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                                        isActive
                                            ? "bg-white text-black shadow-sm font-bold"
                                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={isActive ? "text-black" : "text-zinc-400"}>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge !== undefined && (
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                                                item.badgeColor
                                                    ? item.badgeColor
                                                    : isActive
                                                      ? "bg-black text-white"
                                                      : "bg-zinc-800 text-zinc-400"
                                            }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                {/* Lower Section: Status & Actions */}
                {collapsed && (
                    <div className="p-3 border-t border-zinc-800/80 flex-shrink-0">
                        <div className="hidden md:flex flex-col items-center gap-3 py-2">
                            {/* Collapsed Logout */}
                            <button
                                onClick={handleLogout}
                                title="Log Out"
                                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors group relative"
                            >
                                <LogOut className="w-4 h-4" />
                                <div className="absolute left-full ml-3 px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-[10px] text-rose-400 rounded whitespace-nowrap shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none">
                                    Log Out
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Application Container (offset dynamically by fixed sidebar) */}
            <div className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out ${collapsed ? "md:pl-20" : "md:pl-64"}`}>
                {/* Top Command Bar */}
                <header className="sticky top-0 z-30 w-full bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* Mobile Hamburger Toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                            aria-label="Toggle navigation menu"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {/* Desktop Sidebar Quick Toggle */}
                        <button
                            onClick={toggleCollapse}
                            className="hidden md:flex items-center justify-center p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors"
                            title={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
                            aria-label="Toggle sidebar"
                        >
                            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                        </button>

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2.5">
                            {collapsed && (
                                <Link
                                    href="/dashboard"
                                    className="hidden md:flex items-center gap-1.5 font-black text-sm tracking-tight uppercase text-white hover:opacity-80 transition-opacity"
                                >
                                    {userName}
                                    <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">STUDIO</span>
                                </Link>
                            )}
                            <ChevronRight className="w-4 h-4 text-zinc-600 hidden sm:inline" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden sm:inline">
                                {currentNav.label}
                            </span>
                        </div>
                    </div>

                    {/* Right Actions Bar */}
                    <div className="flex items-center gap-3">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-700/80 hover:bg-zinc-800/80 hover:border-zinc-600 transition-all"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Live Site</span>
                        </a>

                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Log Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Main Content Viewport */}
                <main className="flex-1 min-w-0 w-full p-4 sm:p-6 md:p-8 lg:p-10">{children}</main>
            </div>
        </div>
    );
}
