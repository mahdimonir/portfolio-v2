"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  FileText,
  FolderKanban,
  Cpu,
  Quote,
  ExternalLink,
  Save,
  LogOut,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  RotateCcw,
  Menu,
  X,
  Briefcase,
  GraduationCap,
  Target,
  Clock,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Upload,
  MessageSquare,
  Send,
  Calendar,
} from "lucide-react";
import portfolioDb from "@/lib/portfolio-db.json";

interface Project {
  id: string;
  title: string;
  stack: string;
  description: string;
  links: { live: string; code: string };
  image: string;
  cta: string;
}

interface SkillItem {
  name: string;
  url: string;
}

interface SkillCategory {
  category: string;
  items: SkillItem[];
}

interface PortfolioData {
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
  socials: { github: string; linkedin: string; twitter: string };
  hero: { headline: string; headlineSecond: string; subheadline: string; availability: string };
  about: {
    label: string;
    education: { school: string; degree: string; years: string };
    experience: { company: string; role: string; years: string }[];
    focus: string[];
  };
  projects: Project[];
  skills: SkillCategory[];
  quote: { text: string; author: string };
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  created_at: string;
}

type Tab = "profile" | "about" | "projects" | "skills" | "quote" | "inquiries";

export default function Dashboard() {
  const [data, setData] = useState<PortfolioData>(portfolioDb as unknown as PortfolioData);
  const [savedData, setSavedData] = useState<PortfolioData>(portfolioDb as unknown as PortfolioData);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [tab, setTab] = useState<Tab>("profile");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loaded, setLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const router = useRouter();

  // Check auth
  useEffect(() => {
    fetch("/api/auth/verify", { credentials: "include" })
      .then((r) => {
        if (!r.ok) {
          router.push("/login");
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Load portfolio data from database
  useEffect(() => {
    if (!authChecked) return;
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error && d.name) {
          setData(d);
          setSavedData(d);
        } else {
          setData(portfolioDb as unknown as PortfolioData);
          setSavedData(portfolioDb as unknown as PortfolioData);
        }
        setLoaded(true);
      })
      .catch(() => {
        setData(portfolioDb as unknown as PortfolioData);
        setSavedData(portfolioDb as unknown as PortfolioData);
        setLoaded(true);
      });
  }, [authChecked]);

  // Load contact messages from Neon DB
  const loadMessages = useCallback(() => {
    if (!authChecked) return;
    fetch("/api/contact", { credentials: "include" })
      .then((r) => r.json())
      .then((msgs) => {
        if (Array.isArray(msgs)) {
          setMessages(msgs);
        }
      })
      .catch(() => {});
  }, [authChecked]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Check if data is modified
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(savedData);
  }, [data, savedData]);

  // Warn on tab close with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      toast.info("Logged out successfully");
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const save = useCallback(async () => {
    if (status === "saving") return;
    setStatus("saving");
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("saved");
        setSavedData(JSON.parse(JSON.stringify(data)));
        toast.success("Portfolio changes saved to Neon Database successfully!");
      } else {
        setStatus("error");
        toast.error("Failed to save changes. Please try again.");
      }
    } catch {
      setStatus("error");
      toast.error("Network error while saving.");
    }
    setTimeout(() => setStatus("idle"), 2500);
  }, [data, status]);

  // Ctrl+S / Cmd+S shortcut to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [save]);

  const revert = () => {
    if (confirm("Are you sure you want to discard unsaved changes?")) {
      setData(JSON.parse(JSON.stringify(savedData)));
      toast.info("Reverted all unsaved changes");
    }
  };

  const update = (path: string, value: unknown) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cur: Record<string, unknown> = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur = cur[keys[i]] as Record<string, unknown>;
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateProject = (index: number, field: string, value: string) => {
    const next = JSON.parse(JSON.stringify(data));
    if (field.startsWith("links.")) {
      next.projects[index].links[field.replace("links.", "")] = value;
    } else {
      next.projects[index][field] = value;
    }
    setData(next);
  };

  // Direct Cloudinary upload handler
  const handleCloudinaryUpload = async (projectIndex: number, file: File) => {
    setUploadingIndex(projectIndex);
    const toastId = toast.loading("Uploading image to Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await res.json();
      if (res.ok && result.url) {
        updateProject(projectIndex, "image", result.url);
        toast.success("Image uploaded to Cloudinary successfully!", { id: toastId });
      } else {
        toast.error(result.error || "Failed to upload image", { id: toastId });
      }
    } catch {
      toast.error("Network error during upload", { id: toastId });
    } finally {
      setUploadingIndex(null);
    }
  };

  const addProject = () => {
    const next = JSON.parse(JSON.stringify(data));
    const newId = String(next.projects.length + 1).padStart(3, "0");
    next.projects.unshift({
      id: newId,
      title: "New Featured Project",
      stack: "React / TypeScript / Node.js",
      description: "Comprehensive overview of the architecture, key technical challenges solved, and deliverables.",
      links: { live: "https://", code: "https://github.com" },
      image: "/p1.png",
      cta: "Live Project",
    });
    setData(next);
    toast.success("New project card added");
  };

  const removeProject = (index: number) => {
    if (confirm(`Delete project "${data.projects[index].title}"?`)) {
      const next = JSON.parse(JSON.stringify(data));
      next.projects.splice(index, 1);
      setData(next);
      toast.info("Project removed");
    }
  };

  const moveProject = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.projects.length) return;
    const next = JSON.parse(JSON.stringify(data));
    const temp = next.projects[index];
    next.projects[index] = next.projects[targetIndex];
    next.projects[targetIndex] = temp;
    setData(next);
  };

  const duplicateProject = (index: number) => {
    const next = JSON.parse(JSON.stringify(data));
    const copy = JSON.parse(JSON.stringify(next.projects[index]));
    copy.id = String(next.projects.length + 1).padStart(3, "0");
    copy.title = `${copy.title} (Copy)`;
    next.projects.splice(index + 1, 0, copy);
    setData(next);
    toast.success("Project duplicated");
  };

  const updateSkill = (catIndex: number, itemIndex: number, field: "name" | "url", value: string) => {
    const next = JSON.parse(JSON.stringify(data));
    next.skills[catIndex].items[itemIndex][field] = value;
    setData(next);
  };

  const addSkill = (catIndex: number) => {
    const next = JSON.parse(JSON.stringify(data));
    next.skills[catIndex].items.push({
      name: "New Skill",
      url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    });
    setData(next);
  };

  const removeSkill = (catIndex: number, itemIndex: number) => {
    const next = JSON.parse(JSON.stringify(data));
    next.skills[catIndex].items.splice(itemIndex, 1);
    setData(next);
  };

  const addCategory = () => {
    const next = JSON.parse(JSON.stringify(data));
    next.skills.push({
      category: "New Tech Category",
      items: [{ name: "Skill", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" }],
    });
    setData(next);
    toast.success("Added new skill category");
  };

  const removeCategory = (catIndex: number) => {
    if (confirm(`Remove entire category "${data.skills[catIndex].category}"?`)) {
      const next = JSON.parse(JSON.stringify(data));
      next.skills.splice(catIndex, 1);
      setData(next);
      toast.info("Category removed");
    }
  };

  const addExperience = () => {
    const next = JSON.parse(JSON.stringify(data));
    next.about.experience.unshift({ company: "Company / Client", role: "Software Engineer", years: "2024 — Present" });
    setData(next);
  };

  const removeExperience = (index: number) => {
    const next = JSON.parse(JSON.stringify(data));
    next.about.experience.splice(index, 1);
    setData(next);
  };

  const addFocus = () => {
    const next = JSON.parse(JSON.stringify(data));
    next.about.focus.push("Scalable Full-Stack Engineering");
    setData(next);
  };

  const removeFocus = (index: number) => {
    const next = JSON.parse(JSON.stringify(data));
    next.about.focus.splice(index, 1);
    setData(next);
  };

  // Modern input classes
  const inputClass =
    "w-full bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all";
  const labelClass =
    "text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between";
  const cardContainerClass =
    "bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 md:p-6 backdrop-blur-sm shadow-sm hover:border-zinc-700/80 transition-colors";

  const tabs: { key: Tab; label: string; count?: number; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile & Hero", icon: <User className="w-4 h-4" /> },
    { key: "about", label: "About & Career", count: data.about.experience.length, icon: <FileText className="w-4 h-4" /> },
    { key: "projects", label: "Selected Works", count: data.projects.length, icon: <FolderKanban className="w-4 h-4" /> },
    {
      key: "skills",
      label: "Skills & Stack",
      count: data.skills.reduce((acc, c) => acc + c.items.length, 0),
      icon: <Cpu className="w-4 h-4" />,
    },
    { key: "quote", label: "Philosophy & Quote", icon: <Quote className="w-4 h-4" /> },
    {
      key: "inquiries",
      label: "Messages & Inquiries",
      count: messages.length,
      icon: <MessageSquare className="w-4 h-4" />,
    },
  ];

  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return data.projects;
    const q = projectSearch.toLowerCase();
    return data.projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.stack.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.id.includes(q)
    );
  }, [data.projects, projectSearch]);

  if (!authChecked || !loaded) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-400 flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          {!authChecked ? "Verifying Session..." : "Loading Portfolio Data..."}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col selection:bg-white selection:text-black">
      {/* Top Command Bar Header */}
      <header className="sticky top-0 z-40 w-full bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight uppercase text-white flex items-center gap-1.5">
                {data.firstName || "STUDIO"}
                <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-medium">
                  ADMIN
                </span>
              </span>
              <span className="hidden sm:inline text-zinc-600">/</span>
              <span className="hidden sm:inline text-xs font-medium text-zinc-400 uppercase tracking-wider">
                {tabs.find((t) => t.key === tab)?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Global Save / Discard / View / Logout Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dirty indicator badge */}
          {isDirty ? (
            <span className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              Unsaved Changes
            </span>
          ) : (
            <span className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Saved
            </span>
          )}

          {isDirty && (
            <button
              onClick={revert}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800/80 transition-all"
              title="Revert to last saved data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Discard</span>
            </button>
          )}

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
            onClick={save}
            disabled={status === "saving" || !isDirty}
            className={`flex items-center gap-2 px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm ${
              !isDirty
                ? "bg-zinc-800 text-zinc-500 cursor-default"
                : "bg-white text-black hover:bg-zinc-200 hover:shadow"
            }`}
          >
            {status === "saving" ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : status === "saved" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
                <kbd className="hidden md:inline text-[9px] bg-black/10 px-1 rounded font-mono font-normal">
                  Ctrl+S
                </kbd>
              </>
            )}
          </button>

          <button
            onClick={logout}
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Full-Width Body */}
      <div className="flex-1 flex w-full min-w-0">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#09090b] border-r border-zinc-800/80 pt-16 md:pt-0 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 flex-shrink-0 flex flex-col justify-between ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="py-6 px-3 flex flex-col gap-1.5">
            <div className="px-3 pb-3 mb-2 border-b border-zinc-800/80">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Navigation Modules
              </span>
            </div>
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    active
                      ? "bg-zinc-100 text-black shadow-sm font-bold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? "text-black" : "text-zinc-400"}>{t.icon}</span>
                    <span>{t.label}</span>
                  </div>
                  {t.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                        active ? "bg-black text-white" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer info */}
          <div className="p-4 m-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Neon DB & Cloudinary</span>
            </div>
            <p className="text-zinc-500 text-[10px] leading-relaxed">
              Connected to Neon PostgreSQL, Gmail SMTP, and Cloudinary storage.
            </p>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          />
        )}

        {/* Full-Width Workspace Content Container */}
        <main className="flex-1 min-w-0 w-full p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
          {/* ========================================================================= */}
          {/* TAB 1: PROFILE & HERO */}
          {/* ========================================================================= */}
          {tab === "profile" && (
            <div className="w-full flex flex-col gap-8">
              <div className="flex flex-col gap-1 border-b border-zinc-800 pb-5">
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                  Profile & Hero Configuration
                </h2>
                <p className="text-xs text-zinc-400">
                  Manage your personal identity, hero headlines, availability badge, and social links.
                </p>
              </div>

              {/* Grid 1: Personal & Contact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {/* Personal Identity Card */}
                <div className={cardContainerClass}>
                  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-zinc-800">
                    <User className="w-4 h-4 text-zinc-300" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                      Personal Identity
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Full Display Name</label>
                      <input
                        className={inputClass}
                        value={data.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Moniruzzaman Mahdi"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        <span>Logo Monogram (First Name)</span>
                        <span className="text-[9px] text-zinc-500">e.g. MAHDI®</span>
                      </label>
                      <input
                        className={inputClass}
                        value={data.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        placeholder="MAHDI"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Professional Title</label>
                      <input
                        className={inputClass}
                        value={data.title}
                        onChange={(e) => update("title", e.target.value)}
                        placeholder="Full Stack Developer"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Primary Role / Tag</label>
                      <input
                        className={inputClass}
                        value={data.role}
                        onChange={(e) => update("role", e.target.value)}
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
                        value={data.location}
                        onChange={(e) => update("location", e.target.value)}
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
                        value={data.timezone}
                        onChange={(e) => update("timezone", e.target.value)}
                        placeholder="UTC+6"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Availability Card */}
                <div className={cardContainerClass}>
                  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-zinc-800">
                    <Mail className="w-4 h-4 text-zinc-300" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                      Contact & Availability Status
                    </h3>
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
                        value={data.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="mahdimoniruzzaman@gmail.com"
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
                        value={data.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+8801876689921"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Contract / Job Availability Text</label>
                      <input
                        className={inputClass}
                        value={data.availability}
                        onChange={(e) => update("availability", e.target.value)}
                        placeholder="Available for freelance & contract work"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Expected Response Time</label>
                      <input
                        className={inputClass}
                        value={data.responseTime}
                        onChange={(e) => update("responseTime", e.target.value)}
                        placeholder="Usually replies within 24 hours"
                      />
                    </div>
                  </div>

                  {/* Live Status Pill Preview */}
                  <div className="mt-5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                      Site Badge Preview:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        {data.hero.availability || "AVAILABLE FOR WORK"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 2: Hero Section & Social Links */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                {/* Hero Section Config (2 Cols) */}
                <div className={`${cardContainerClass} lg:col-span-2 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-zinc-800">
                      <Sparkles className="w-4 h-4 text-zinc-300" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                        Hero Section Typography
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={labelClass}>Headline Line 1</label>
                        <input
                          className={inputClass + " font-black uppercase text-base"}
                          value={data.hero.headline}
                          onChange={(e) => update("hero.headline", e.target.value)}
                          placeholder="DRIVEN"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Headline Line 2</label>
                        <input
                          className={inputClass + " font-black uppercase text-base"}
                          value={data.hero.headlineSecond}
                          onChange={(e) => update("hero.headlineSecond", e.target.value)}
                          placeholder="BY LOGIC"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Hero Top Badge Text</label>
                        <input
                          className={inputClass}
                          value={data.hero.availability}
                          onChange={(e) => update("hero.availability", e.target.value)}
                          placeholder="Available for work"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Hero Subheadline Description</label>
                        <textarea
                          className={inputClass + " resize-y min-h-[80px] leading-relaxed"}
                          rows={3}
                          value={data.hero.subheadline}
                          onChange={(e) => update("hero.subheadline", e.target.value)}
                          placeholder="Building robust software, automating the complex..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Hero Banner Preview */}
                  <div className="mt-4 p-5 rounded-lg bg-black border border-zinc-800 flex flex-col gap-2">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">
                      Hero Preview
                    </span>
                    <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white leading-none">
                      {data.hero.headline || "DRIVEN"}
                      <br />
                      {data.hero.headlineSecond || "BY LOGIC"}
                    </h4>
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mt-1">
                      {data.hero.subheadline}
                    </p>
                  </div>
                </div>

                {/* Social Links Card (1 Col) */}
                <div className={cardContainerClass}>
                  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-zinc-800">
                    <Target className="w-4 h-4 text-zinc-300" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                      Social Accounts
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className={labelClass}>
                        <span className="flex items-center gap-1.5">
                          <Github className="w-3.5 h-3.5" /> GitHub Profile URL
                        </span>
                        {data.socials.github && (
                          <a
                            href={data.socials.github}
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
                        value={data.socials.github}
                        onChange={(e) => update("socials.github", e.target.value)}
                        placeholder="https://github.com/..."
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        <span className="flex items-center gap-1.5">
                          <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile URL
                        </span>
                        {data.socials.linkedin && (
                          <a
                            href={data.socials.linkedin}
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
                        value={data.socials.linkedin}
                        onChange={(e) => update("socials.linkedin", e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        <span className="flex items-center gap-1.5">
                          <Twitter className="w-3.5 h-3.5 text-sky-400" /> Twitter / X Profile URL
                        </span>
                        {data.socials.twitter && (
                          <a
                            href={data.socials.twitter}
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
                        value={data.socials.twitter}
                        onChange={(e) => update("socials.twitter", e.target.value)}
                        placeholder="https://x.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ABOUT & CAREER */}
          {/* ========================================================================= */}
          {tab === "about" && (
            <div className="w-full flex flex-col gap-8">
              <div className="flex flex-col gap-1 border-b border-zinc-800 pb-5">
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                  About & Career Milestones
                </h2>
                <p className="text-xs text-zinc-400">
                  Configure background education, focus pillars, and professional work history.
                </p>
              </div>

              {/* Top row: Section Label + Education + Focus Areas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                {/* Section Label & Education */}
                <div className={`${cardContainerClass} lg:col-span-2 flex flex-col gap-6`}>
                  <div>
                    <label className={labelClass}>Section Overline Label</label>
                    <input
                      className={inputClass}
                      value={data.about.label}
                      onChange={(e) => update("about.label", e.target.value)}
                      placeholder="Background & Data"
                    />
                  </div>

                  <div className="pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="w-4 h-4 text-zinc-300" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                        Formal Education
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Institution / University</label>
                        <input
                          className={inputClass}
                          value={data.about.education.school}
                          onChange={(e) => update("about.education.school", e.target.value)}
                          placeholder="National University"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Degree / Field</label>
                        <input
                          className={inputClass}
                          value={data.about.education.degree}
                          onChange={(e) => update("about.education.degree", e.target.value)}
                          placeholder="Bachelor of Science"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Academic Years</label>
                        <input
                          className={inputClass}
                          value={data.about.education.years}
                          onChange={(e) => update("about.education.years", e.target.value)}
                          placeholder="2024 – Present"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Focus Areas Card */}
                <div className={cardContainerClass}>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-zinc-300" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                        Core Focus Areas
                      </h3>
                    </div>
                    <button
                      onClick={addFocus}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase text-white bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {data.about.focus.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          className={inputClass + " py-1.5 text-xs"}
                          value={f}
                          onChange={(e) => {
                            const next = JSON.parse(JSON.stringify(data));
                            next.about.focus[i] = e.target.value;
                            setData(next);
                          }}
                          placeholder="Focus pillar..."
                        />
                        <button
                          onClick={() => removeFocus(i)}
                          className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Work Experience Timeline */}
              <div className="w-full flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-zinc-300" />
                    <h3 className="text-base font-bold uppercase tracking-wider text-zinc-200">
                      Work Experience Timeline ({data.about.experience.length})
                    </h3>
                  </div>
                  <button
                    onClick={addExperience}
                    className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {data.about.experience.map((exp, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                          Role #{i + 1}
                        </span>
                        <button
                          onClick={() => removeExperience(i)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div>
                          <label className={labelClass}>Company / Client</label>
                          <input
                            className={inputClass}
                            value={exp.company}
                            onChange={(e) => {
                              const next = JSON.parse(JSON.stringify(data));
                              next.about.experience[i].company = e.target.value;
                              setData(next);
                            }}
                            placeholder="Company Name"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Job Title / Role</label>
                          <input
                            className={inputClass}
                            value={exp.role}
                            onChange={(e) => {
                              const next = JSON.parse(JSON.stringify(data));
                              next.about.experience[i].role = e.target.value;
                              setData(next);
                            }}
                            placeholder="Full Stack Developer"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Duration / Years</label>
                          <input
                            className={inputClass}
                            value={exp.years}
                            onChange={(e) => {
                              const next = JSON.parse(JSON.stringify(data));
                              next.about.experience[i].years = e.target.value;
                              setData(next);
                            }}
                            placeholder="2023 – Present"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PROJECTS (SELECTED WORKS) WITH CLOUDINARY UPLOAD */}
          {/* ========================================================================= */}
          {tab === "projects" && (
            <div className="w-full flex flex-col gap-6">
              {/* Header + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Selected Works Editor
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                      {data.projects.length} Total
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage 3D scroll stack cards, live demonstration links, and upload images directly to Cloudinary.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <button
                    onClick={addProject}
                    className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Project
                  </button>
                </div>
              </div>

              {/* Full Width Project Cards Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                {filteredProjects.map((project, i) => (
                  <div
                    key={project.id || i}
                    className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 hover:border-zinc-700 transition-all shadow-md"
                  >
                    {/* Top Row: ID Badge & Controls */}
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm bg-zinc-800 text-zinc-200 px-2.5 py-0.5 rounded-md">
                          #{project.id}
                        </span>
                        <h3 className="font-black text-base uppercase text-white truncate max-w-[200px] sm:max-w-xs">
                          {project.title || "Untitled Project"}
                        </h3>
                      </div>

                      {/* Reorder / Duplicate / Delete controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveProject(i, "up")}
                          disabled={i === 0}
                          className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800"
                          title="Move up in scroll stack"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveProject(i, "down")}
                          disabled={i === data.projects.length - 1}
                          className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800"
                          title="Move down in scroll stack"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateProject(i)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                          title="Duplicate project"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeProject(i)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Middle: Content & Image */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      {/* Image Thumbnail Preview & Cloudinary Upload (5 cols) */}
                      <div className="md:col-span-5 flex flex-col gap-2.5">
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <span className="text-[10px] text-zinc-600 font-mono uppercase">
                            Preview Image
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className={labelClass}>Image URL / Path</label>
                            {project.image.includes("cloudinary.com") && (
                              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
                                Cloudinary
                              </span>
                            )}
                          </div>
                          <input
                            className={inputClass + " font-mono text-xs mb-2"}
                            value={project.image}
                            onChange={(e) => updateProject(i, "image", e.target.value)}
                            placeholder="/p1.png or https://..."
                          />

                          {/* Hidden file input */}
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => {
                              fileInputRefs.current[i] = el;
                            }}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleCloudinaryUpload(i, file);
                            }}
                          />

                          {/* Cloudinary Upload Trigger Button */}
                          <button
                            type="button"
                            disabled={uploadingIndex === i}
                            onClick={() => fileInputRefs.current[i]?.click()}
                            className="w-full py-2 px-3 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                          >
                            {uploadingIndex === i ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Upload to Cloudinary</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Project Fields (7 cols) */}
                      <div className="md:col-span-7 flex flex-col gap-3">
                        <div>
                          <label className={labelClass}>Project Title</label>
                          <input
                            className={inputClass + " font-bold"}
                            value={project.title}
                            onChange={(e) => updateProject(i, "title", e.target.value)}
                            placeholder="Platform Name"
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Tech Stack (Slash-delimited)</label>
                          <input
                            className={inputClass}
                            value={project.stack}
                            onChange={(e) => updateProject(i, "stack", e.target.value)}
                            placeholder="React / Node.js / MongoDB"
                          />
                        </div>

                        <div>
                          <label className={labelClass}>CTA Button Text</label>
                          <input
                            className={inputClass}
                            value={project.cta}
                            onChange={(e) => updateProject(i, "cta", e.target.value)}
                            placeholder="Live Project"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description Textarea */}
                    <div>
                      <label className={labelClass}>Card Description</label>
                      <textarea
                        className={inputClass + " resize-y min-h-[75px] leading-relaxed"}
                        rows={2}
                        value={project.description}
                        onChange={(e) => updateProject(i, "description", e.target.value)}
                        placeholder="Comprehensive project summary..."
                      />
                    </div>

                    {/* Links Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                      <div>
                        <label className={labelClass}>
                          <span>Live Demo URL</span>
                          {project.links.live && (
                            <a
                              href={project.links.live}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9px] text-zinc-400 hover:text-white"
                            >
                              Test URL ↗
                            </a>
                          )}
                        </label>
                        <input
                          className={inputClass + " text-xs font-mono"}
                          value={project.links.live}
                          onChange={(e) => updateProject(i, "links.live", e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          <span>Source Code URL</span>
                          {project.links.code && project.links.code !== "#" && (
                            <a
                              href={project.links.code}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9px] text-zinc-400 hover:text-white"
                            >
                              Test Code ↗
                            </a>
                          )}
                        </label>
                        <input
                          className={inputClass + " text-xs font-mono"}
                          value={project.links.code}
                          onChange={(e) => updateProject(i, "links.code", e.target.value)}
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SKILLS & STACK */}
          {/* ========================================================================= */}
          {tab === "skills" && (
            <div className="w-full flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Skills & Tech Categories
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                      {data.skills.reduce((acc, c) => acc + c.items.length, 0)} Total Technologies
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Organize your tech stacks with live SVG icons rendered directly from CDNs.
                  </p>
                </div>

                <button
                  onClick={addCategory}
                  className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>

              {/* Full Width Grid of Category Cards (4 cols on widescreen) */}
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 w-full">
                {data.skills.map((cat, catIndex) => (
                  <div
                    key={catIndex}
                    className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between gap-5 hover:border-zinc-700 transition-all shadow-sm"
                  >
                    <div>
                      {/* Category Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3 mb-4">
                        <input
                          className="bg-transparent font-black text-sm uppercase tracking-wider text-white border-b border-transparent hover:border-zinc-700 focus:border-zinc-400 focus:outline-none py-1 w-full"
                          value={cat.category}
                          onChange={(e) => {
                            const next = JSON.parse(JSON.stringify(data));
                            next.skills[catIndex].category = e.target.value;
                            setData(next);
                          }}
                          placeholder="Category Name"
                        />
                        <button
                          onClick={() => removeCategory(catIndex)}
                          className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Items List */}
                      <div className="flex flex-col gap-2.5">
                        {cat.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-2.5 flex flex-col gap-2 group hover:border-zinc-700 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Live SVG Thumbnail */}
                              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1.5 flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.opacity = "0.2";
                                  }}
                                />
                              </div>

                              <input
                                className="bg-transparent text-xs font-semibold text-zinc-200 border-b border-transparent focus:border-zinc-400 focus:outline-none flex-1 py-1"
                                placeholder="Technology Name"
                                value={item.name}
                                onChange={(e) =>
                                  updateSkill(catIndex, itemIndex, "name", e.target.value)
                                }
                              />

                              <button
                                onClick={() => removeSkill(catIndex, itemIndex)}
                                className="text-zinc-500 hover:text-rose-400 p-1 rounded"
                                title="Remove skill"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <input
                              className="bg-zinc-900/80 border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-zinc-400 focus:outline-none focus:border-zinc-600 w-full"
                              placeholder="DevIcon SVG URL"
                              value={item.url}
                              onChange={(e) =>
                                updateSkill(catIndex, itemIndex, "url", e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Skill Button */}
                    <button
                      onClick={() => addSkill(catIndex)}
                      className="w-full py-2 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Technology
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: PHILOSOPHY & QUOTE */}
          {/* ========================================================================= */}
          {tab === "quote" && (
            <div className="w-full flex flex-col gap-8">
              <div className="flex flex-col gap-1 border-b border-zinc-800 pb-5">
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                  Philosophy & Core Quote
                </h2>
                <p className="text-xs text-zinc-400">
                  Configure the primary philosophical statement featured on your portfolio.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
                {/* Inputs (5 cols) */}
                <div className={`${cardContainerClass} lg:col-span-5 flex flex-col gap-5`}>
                  <div className="flex items-center gap-2 mb-2 pb-3 border-b border-zinc-800">
                    <Quote className="w-4 h-4 text-zinc-300" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                      Quote Parameters
                    </h3>
                  </div>

                  <div>
                    <label className={labelClass}>Quote Statement</label>
                    <textarea
                      className={inputClass + " resize-y min-h-[140px] text-base leading-relaxed"}
                      rows={5}
                      value={data.quote.text}
                      onChange={(e) => update("quote.text", e.target.value)}
                      placeholder="The function of good software is to make the complex appear to be simple."
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Attributed Author / Figure</label>
                    <input
                      className={inputClass + " font-bold"}
                      value={data.quote.author}
                      onChange={(e) => update("quote.author", e.target.value)}
                      placeholder="Grady Booch"
                    />
                  </div>
                </div>

                {/* Live Section Preview (7 cols) */}
                <div className="lg:col-span-7 bg-white text-black rounded-2xl p-8 sm:p-12 shadow-2xl border border-zinc-200 flex flex-col justify-center min-h-[360px]">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">
                    Live Section Rendering
                  </span>
                  <blockquote className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase leading-tight tracking-tight text-black">
                    "{data.quote.text || "Your philosophy statement will appear here."}"
                  </blockquote>
                  <p className="mt-8 text-base font-bold text-zinc-600 uppercase tracking-wider">
                    — {data.quote.author || "Author"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: INQUIRIES & CONTACT MESSAGES */}
          {/* ========================================================================= */}
          {tab === "inquiries" && (
            <div className="w-full flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Inquiries & Messages
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                      {messages.length} Received
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Direct messages submitted via your portfolio contact form, persisted in Neon DB and sent via Gmail SMTP.
                  </p>
                </div>

                <button
                  onClick={loadMessages}
                  className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {messages.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col items-center justify-center gap-3">
                  <Mail className="w-8 h-8 text-zinc-600" />
                  <h3 className="text-base font-bold uppercase tracking-wider text-zinc-400">
                    No Messages Yet
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    Inquiries sent through the portfolio Contact form will be displayed here and delivered to your inbox.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-zinc-700 transition-colors shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{m.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">#{m.id}</span>
                          </div>
                          <a
                            href={`mailto:${m.email}`}
                            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Mail className="w-3 h-3" />
                            {m.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded">
                          <Calendar className="w-3 h-3" />
                          {new Date(m.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      {m.subject && (
                        <div className="text-xs font-semibold text-zinc-300">
                          <span className="text-zinc-500">Subject: </span>
                          {m.subject}
                        </div>
                      )}

                      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-3 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap">
                        {m.message}
                      </div>

                      <div className="flex justify-end pt-1">
                        <a
                          href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Your Inquiry")}`}
                          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Send className="w-3 h-3" /> Reply via Email
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
