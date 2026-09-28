"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Clock,
    Sparkles,
    Save,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    Github,
    Linkedin,
    Twitter,
    Target,
} from "lucide-react";

export interface ProfileData {
    name: string;
    firstName: string;
    title: string;
    role: string;
    location: string;
    email: string;
    phone: string;
    timezone: string;
    availability: string;
    responseTime: string;
    socials: {
        github: string;
        linkedin: string;
        twitter: string;
    };
    hero: {
        headline: string;
        headlineSecond: string;
        subheadline: string;
        availability: string;
    };
}

export default function ProfileDashboardPage() {
    const [profile, setProfile] = useState<ProfileData>({
        name: "",
        firstName: "",
        title: "",
        role: "",
        location: "",
        email: "",
        phone: "",
        timezone: "",
        availability: "",
        responseTime: "",
        socials: { github: "", linkedin: "", twitter: "" },
        hero: { headline: "", headlineSecond: "", subheadline: "", availability: "" },
    });
    const [savedProfile, setSavedProfile] = useState<ProfileData>(profile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await fetch("/api/portfolio");
            const data = await res.json();
            if (data?.name) {
                const normalized: ProfileData = {
                    name: data.name || "",
                    firstName: data.firstName || "",
                    title: data.title || "",
                    role: data.role || "",
                    location: data.location || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    timezone: data.timezone || "",
                    availability: data.availability || "",
                    responseTime: data.responseTime || "",
                    socials: {
                        github: data.socials?.github || "",
                        linkedin: data.socials?.linkedin || "",
                        twitter: data.socials?.twitter || "",
                    },
                    hero: {
                        headline: data.hero?.headline || "",
                        headlineSecond: data.hero?.headlineSecond || "",
                        subheadline: data.hero?.subheadline || "",
                        availability: data.hero?.availability || "",
                    },
                };
                setProfile(normalized);
                setSavedProfile(JSON.parse(JSON.stringify(normalized)));
            }
        } catch (err) {
            console.error("Failed to load profile data:", err);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isDirty = JSON.stringify(profile) !== JSON.stringify(savedProfile);

    const handleSave = async () => {
        setSaving(true);
        try {
            const currentRes = await fetch("/api/portfolio");
            const currentData = await currentRes.json();

            const payload = {
                ...currentData,
                ...profile,
                socials: profile.socials,
                hero: profile.hero,
            };

            const res = await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setSavedProfile(JSON.parse(JSON.stringify(profile)));
                toast.success("Profile & hero details saved to database!");
            } else {
                toast.error("Failed to save profile changes.");
            }
        } catch {
            toast.error("Network error while saving.");
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if (confirm("Discard all unsaved changes to Profile & Hero?")) {
            setProfile(JSON.parse(JSON.stringify(savedProfile)));
            toast.info("Reverted unsaved changes");
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSave]);

    const inputClass =
        "w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all";
    const labelClass =
        "text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between";
    const cardClass =
        "bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-7 h-7 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">
                    Loading Profile Settings...
                </span>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Top Command Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        Profile & Identity
                        {isDirty ? (
                            <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Unsaved
                            </span>
                        ) : (
                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Synced
                            </span>
                        )}
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Personal identity parameters, hero typography, public work availability, and social channels.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {isDirty && (
                        <button
                            onClick={handleDiscard}
                            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white px-3 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Discard
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                            !isDirty
                                ? "bg-zinc-800 text-zinc-500 cursor-default"
                                : "bg-white text-black hover:bg-zinc-200"
                        }`}
                    >
                        {saving ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Grid 1: Personal & Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {/* Personal Identity Card */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 pb-3 mb-5 border-b border-zinc-800">
                        <User className="w-4 h-4 text-zinc-300" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                            Personal Identity
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Full Display Name</label>
                            <input
                                className={inputClass}
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                placeholder="Moniruzzaman Mahdi"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                <span>Logo Monogram (First Name)</span>
                                <span className="text-[9px] text-zinc-500 font-mono">e.g. MAHDI®</span>
                            </label>
                            <input
                                className={inputClass}
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                placeholder="MAHDI"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Professional Title</label>
                            <input
                                className={inputClass}
                                value={profile.title}
                                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                                placeholder="Full Stack Developer"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Primary Role / Tag</label>
                            <input
                                className={inputClass}
                                value={profile.role}
                                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                                placeholder="Full Stack Developer"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Location
                                </span>
                            </label>
                            <input
                                className={inputClass}
                                value={profile.location}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                placeholder="Chattogram, Bangladesh"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Timezone
                                </span>
                            </label>
                            <input
                                className={inputClass}
                                value={profile.timezone}
                                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                                placeholder="UTC+6"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact & Availability Status Card */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 pb-3 mb-5 border-b border-zinc-800">
                        <Mail className="w-4 h-4 text-zinc-300" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                            Contact & Availability
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> Email Address
                                </span>
                            </label>
                            <input
                                className={inputClass}
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                placeholder="example@email.com"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> Phone / WhatsApp
                                </span>
                            </label>
                            <input
                                className={inputClass}
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="+8801876689921"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelClass}>Contract / Job Availability Text</label>
                            <input
                                className={inputClass}
                                value={profile.availability}
                                onChange={(e) =>
                                    setProfile({ ...profile, availability: e.target.value })
                                }
                                placeholder="Available for freelance & contract work"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelClass}>Expected Response Time</label>
                            <input
                                className={inputClass}
                                value={profile.responseTime}
                                onChange={(e) =>
                                    setProfile({ ...profile, responseTime: e.target.value })
                                }
                                placeholder="Usually replies within 24 hours"
                            />
                        </div>
                    </div>

                    {/* Live Status Pill Preview */}
                    <div className="mt-5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 font-mono">
                            Site Badge Preview:
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                {profile.hero?.availability || "AVAILABLE FOR WORK"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid 2: Hero Section Typography & Social Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                {/* Hero Typography (2 Cols) */}
                <div className={`${cardClass} lg:col-span-2`}>
                    <div>
                        <div className="flex items-center gap-2 pb-3 mb-5 border-b border-zinc-800">
                            <Sparkles className="w-4 h-4 text-zinc-300" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                                Hero Section Typography
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className={labelClass}>Headline Line 1</label>
                                <input
                                    className={inputClass + " font-black uppercase text-base"}
                                    value={profile.hero.headline}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            hero: { ...profile.hero, headline: e.target.value },
                                        })
                                    }
                                    placeholder="DRIVEN"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Headline Line 2</label>
                                <input
                                    className={inputClass + " font-black uppercase text-base"}
                                    value={profile.hero.headlineSecond}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            hero: { ...profile.hero, headlineSecond: e.target.value },
                                        })
                                    }
                                    placeholder="BY LOGIC"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className={labelClass}>Hero Top Availability Badge Text</label>
                                <input
                                    className={inputClass}
                                    value={profile.hero.availability}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            hero: { ...profile.hero, availability: e.target.value },
                                        })
                                    }
                                    placeholder="Available for work"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className={labelClass}>Hero Subheadline Description</label>
                                <textarea
                                    className={inputClass + " resize-y min-h-[75px] leading-relaxed"}
                                    rows={3}
                                    value={profile.hero.subheadline}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            hero: { ...profile.hero, subheadline: e.target.value },
                                        })
                                    }
                                    placeholder="Building robust software, automating the complex..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Live Hero Banner Preview */}
                    <div className="mt-4 p-5 rounded-xl bg-black border border-zinc-800 flex flex-col gap-2">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold font-mono">
                            Live Hero Preview
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white leading-none">
                            {profile.hero.headline || "DRIVEN"}
                            <br />
                            {profile.hero.headlineSecond || "BY LOGIC"}
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mt-1">
                            {profile.hero.subheadline}
                        </p>
                    </div>
                </div>

                {/* Social Accounts (1 Col) */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 pb-3 mb-5 border-b border-zinc-800">
                        <Target className="w-4 h-4 text-zinc-300" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                            Social Accounts
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>
                                <span className="flex items-center gap-1.5">
                                    <Github className="w-3.5 h-3.5" /> GitHub URL
                                </span>
                                {profile.socials.github && (
                                    <a
                                        href={profile.socials.github}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[9px] text-zinc-400 hover:text-white"
                                    >
                                        Visit ↗
                                    </a>
                                )}
                            </label>
                            <input
                                className={inputClass}
                                value={profile.socials.github}
                                onChange={(e) =>
                                    setProfile({
                                        ...profile,
                                        socials: { ...profile.socials, github: e.target.value },
                                    })
                                }
                                placeholder="https://github.com/..."
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                <span className="flex items-center gap-1.5">
                                    <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn URL
                                </span>
                                {profile.socials.linkedin && (
                                    <a
                                        href={profile.socials.linkedin}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[9px] text-zinc-400 hover:text-white"
                                    >
                                        Visit ↗
                                    </a>
                                )}
                            </label>
                            <input
                                className={inputClass}
                                value={profile.socials.linkedin}
                                onChange={(e) =>
                                    setProfile({
                                        ...profile,
                                        socials: { ...profile.socials, linkedin: e.target.value },
                                    })
                                }
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                <span className="flex items-center gap-1.5">
                                    <Twitter className="w-3.5 h-3.5 text-sky-400" /> Twitter / X URL
                                </span>
                                {profile.socials.twitter && (
                                    <a
                                        href={profile.socials.twitter}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[9px] text-zinc-400 hover:text-white"
                                    >
                                        Visit ↗
                                    </a>
                                )}
                            </label>
                            <input
                                className={inputClass}
                                value={profile.socials.twitter}
                                onChange={(e) =>
                                    setProfile({
                                        ...profile,
                                        socials: { ...profile.socials, twitter: e.target.value },
                                    })
                                }
                                placeholder="https://x.com/..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
