"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { DashboardInquiriesSkeleton } from "@/components/dashboard/DashboardSkeletons";
import {
    MessageSquare,
    Mail,
    Calendar,
    RotateCcw,
    Send,
    Trash2,
    Eye,
    EyeOff,
    Search,
    Inbox,
    ChevronLeft,
    ChevronRight,
    CheckCheck,
    X,
    ArrowUpDown,
} from "lucide-react";

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject?: string | null;
    message: string;
    read: boolean;
    createdAt?: string;
    created_at?: string;
}

export default function InquiriesDashboardPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(8);
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

    const loadMessages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/contact", { credentials: "include" });
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
            }
        } catch (err) {
            console.error("Failed to load inquiries:", err);
            toast.error("Failed to load inquiries");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const handleToggleRead = async (msg: ContactMessage) => {
        try {
            const res = await fetch("/api/contact", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id: msg.id, read: !msg.read }),
            });

            if (res.ok) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === msg.id ? { ...m, read: !m.read } : m))
                );
                toast.success(msg.read ? "Marked as unread" : "Marked as read");
            } else {
                toast.error("Failed to update message status");
            }
        } catch {
            toast.error("Network error updating status");
        }
    };

    const handleMarkAllRead = async () => {
        const unread = messages.filter((m) => !m.read);
        if (unread.length === 0) return;
        setMessages((prev) => prev.map((m) => ({ ...m, read: true })));

        try {
            const res = await fetch("/api/contact", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ allRead: true }),
            });

            if (res.ok) {
                toast.success("All unread inquiries marked as read!");
            } else {
                toast.error("Failed to mark all as read");
                loadMessages();
            }
        } catch {
            toast.error("Network error updating messages");
            loadMessages();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Permanently delete this inquiry from database?")) return;
        try {
            const res = await fetch(`/api/contact?id=${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.ok) {
                setMessages((prev) => prev.filter((m) => m.id !== id));
                toast.info("Inquiry deleted");
            } else {
                toast.error("Failed to delete inquiry");
            }
        } catch {
            toast.error("Network error deleting inquiry");
        }
    };

    const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

    const filteredMessages = useMemo(() => {
        const list = messages.filter((m) => {
            if (filter === "unread" && m.read) return false;
            if (filter === "read" && !m.read) return false;

            const q = search.toLowerCase().trim();
            if (!q) return true;

            return (
                m.name.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q) ||
                (m.subject && m.subject.toLowerCase().includes(q)) ||
                m.message.toLowerCase().includes(q) ||
                String(m.id).includes(q)
            );
        });

        return list.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
            const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });
    }, [messages, filter, search, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(filteredMessages.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedMessages = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredMessages.slice(start, start + pageSize);
    }, [filteredMessages, safeCurrentPage, pageSize]);

    if (loading) {
        return <DashboardInquiriesSkeleton />;
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        Inquiries Inbox
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                            {messages.length} Total
                        </span>
                        {unreadCount > 0 && (
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black">
                                {unreadCount} UNREAD
                            </span>
                        )}
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Direct inquiries submitted through your public contact form, persisted in Neon DB and mirrored to Gmail.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                        >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
                        </button>
                    )}
                    <button
                        onClick={loadMessages}
                        className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Refresh Inbox
                    </button>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40 border border-zinc-800/80 p-3.5 rounded-2xl">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by name, email, subject, or keywords..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                    {search && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setCurrentPage(1);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Filter Tabs */}
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-xs">
                        <button
                            onClick={() => {
                                setFilter("all");
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                                filter === "all" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            All ({messages.length})
                        </button>
                        <button
                            onClick={() => {
                                setFilter("unread");
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                                filter === "unread" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => {
                                setFilter("read");
                                setCurrentPage(1);
                            }}
                            className={`px-3 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                                filter === "read" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            Read ({messages.length - unreadCount})
                        </button>
                    </div>

                    {/* Sort Order Toggle */}
                    <button
                        onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                        className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors"
                        title="Toggle Sort Date Order"
                    >
                        <ArrowUpDown className="w-3 h-3" />
                        <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
                    </button>
                </div>
            </div>

            {/* Messages Cards Grid */}
            {filteredMessages.length === 0 ? (
                <div className="p-16 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col items-center justify-center gap-3">
                    <Inbox className="w-8 h-8 text-zinc-600" />
                    <h3 className="text-base font-bold uppercase tracking-wider text-zinc-400">
                        {filter === "unread" ? "No Unread Inquiries" : "No Messages Found"}
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-sm">
                        {filter === "unread"
                            ? "All incoming contact messages have been reviewed."
                            : "Inquiries submitted through your portfolio contact form will appear here."}
                    </p>
                    {(search || filter !== "all") && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setFilter("all");
                                setCurrentPage(1);
                            }}
                            className="text-xs text-cyan-400 hover:underline font-mono"
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
                        {paginatedMessages.map((m) => {
                            const dateStr = m.createdAt || m.created_at || new Date().toISOString();

                            return (
                                <div
                                    key={m.id}
                                    className={`border rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-sm ${
                                        !m.read
                                            ? "bg-zinc-900/80 border-amber-500/40"
                                            : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
                                    }`}
                                >
                                    {/* Top Sender Info */}
                                    <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3.5">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-base text-white">{m.name}</span>
                                                <span className="text-[10px] font-mono text-zinc-500">#{m.id}</span>
                                                {!m.read ? (
                                                    <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                                                        UNREAD
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                                                        READ
                                                    </span>
                                                )}
                                            </div>

                                            <a
                                                href={`mailto:${m.email}`}
                                                className="text-xs text-cyan-400 hover:underline flex items-center gap-1.5 mt-1"
                                            >
                                                <Mail className="w-3.5 h-3.5" />
                                                <span>{m.email}</span>
                                            </a>
                                        </div>

                                        <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(dateStr).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </div>

                                    {/* Subject Line */}
                                    {m.subject && (
                                        <div className="text-xs font-semibold text-zinc-200">
                                            <span className="text-zinc-500 uppercase font-mono text-[10px]">Subject: </span>
                                            {m.subject}
                                        </div>
                                    )}

                                    {/* Message Content */}
                                    <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap font-sans">
                                        {m.message}
                                    </div>

                                    {/* Actions Bar */}
                                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleRead(m)}
                                                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors"
                                            >
                                                {m.read ? (
                                                    <>
                                                        <EyeOff className="w-3.5 h-3.5" />
                                                        <span>Mark Unread</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Mark Read</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                title="Delete Message"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <a
                                            href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Your Inquiry")}`}
                                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-zinc-200 px-4 py-2 rounded-lg transition-colors shadow-sm"
                                        >
                                            <Send className="w-3 h-3" /> Reply
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-zinc-400 font-mono text-xs">
                                Showing{" "}
                                <strong className="text-white">
                                    {(safeCurrentPage - 1) * pageSize + 1}–
                                    {Math.min(safeCurrentPage * pageSize, filteredMessages.length)}
                                </strong>{" "}
                                of <strong className="text-white">{filteredMessages.length}</strong> inquiries
                            </span>

                            {/* Per-Page Limit Selector at Bottom */}
                            <div className="flex items-center gap-2 pl-3 border-l border-zinc-800">
                                <span className="text-[11px] font-mono text-zinc-500 uppercase">Per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-zinc-500 cursor-pointer"
                                >
                                    <option value={4}>4</option>
                                    <option value={8}>8</option>
                                    <option value={16}>16</option>
                                    <option value={messages.length || 100}>All ({messages.length})</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safeCurrentPage <= 1}
                                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 flex items-center gap-1.5 transition-colors"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Previous</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                                    <button
                                        key={pg}
                                        onClick={() => setCurrentPage(pg)}
                                        className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-colors ${
                                            pg === safeCurrentPage
                                                ? "bg-white text-black"
                                                : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
                                        }`}
                                    >
                                        {pg}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safeCurrentPage >= totalPages}
                                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 flex items-center gap-1.5 transition-colors"
                            >
                                <span>Next</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
