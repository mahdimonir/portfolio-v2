import { prisma } from "@/lib/prisma";
import fallbackDb from "@/lib/portfolio-db.json";

// Type definitions matching UI expectations
export interface PortfolioData {
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
    resumeUrl?: string;
    socials: {
        github: string;
        linkedin: string;
        twitter: string;
        portfolio3d?: string;
    };
    hero: {
        headline: string;
        headlineSecond: string;
        subheadline: string;
        availability: string;
    };
    about: {
        label: string;
        education: Array<{
            degree: string;
            institution: string;
            period: string;
            current?: boolean;
        }>;
        experience: Array<{
            company: string;
            role: string;
            period: string;
            location?: string | null;
            current?: boolean;
            companyUrl?: string | null;
            companyLogo?: string | null;
            description?: string | null;
            achievements: string[];
        }>;
        courses: Array<{
            title: string;
            institution: string;
            period: string;
            certificateUrl?: string | null;
            completed?: boolean;
        }>;
        focus: string[];
        summary?: string;
        avatarUrl?: string;
        resumeUrl?: string;
        topBackLabel?: string;
        topResumeLabel?: string;
        topContactLabel?: string;
        portraitTag?: string;
        portraitStatus?: string;
        websiteUrl?: string;
        experienceBadge?: string;
        experienceHeading?: string;
        experienceDescription?: string;
        projectsBadge?: string;
        projectsHeading?: string;
        projectsDescription?: string;
        projectsArchiveLabel?: string;
        skillsBadge?: string;
        skillsHeading?: string;
        skillsDescription?: string;
        specializationsBadge?: string;
        specializationsHeading?: string;
        specializationsDescription?: string;
        credentialsBadge?: string;
        credentialsHeading?: string;
        credentialsDescription?: string;
        educationHeading?: string;
        coursesHeading?: string;
        ctaLabel?: string;
        ctaHeading?: string;
        ctaDescription?: string;
        ctaResumeButtonText?: string;
        ctaContactButtonText?: string;
        specializations: Array<{
            id?: string;
            title: string;
            description: string;
            skills?: string[];
            points?: string[];
        }>;
    };
    projects: Array<{
        id: string;
        slug: string;
        title: string;
        tagline?: string | null;
        stack: string;
        description: string;
        longDescription?: string | null;
        image: string;
        images: string[];
        links: {
            live?: string | null;
            code?: string | null;
            api?: string | null;
            play_store?: string | null;
            app_store?: string | null;
        };
        cta: string;
        category: string;
        role?: string | null;
        duration?: string | null;
        client?: string | null;
        status?: string | null;
        featured?: boolean;
        features: string[];
        tech: Array<{
            name: string;
            category: string;
            iconUrl?: string | null;
        }>;
        variants?: Array<{
            id?: number | string;
            name: string;
            badge?: string | null;
            previewImage?: string | null;
            liveUrl?: string | null;
            order?: number;
        }>;
    }>;
    skills: Array<{
        category: string;
        items: Array<{
            name: string;
            url: string;
        }>;
    }>;
    quote: {
        text: string;
        author: string;
    };
}

export type ProjectItem = PortfolioData["projects"][number];

// High-speed in-memory cache with globalThis sharing across Next.js API routes & Server Components
const globalPortfolioCache = globalThis as unknown as {
    __cachedPortfolio?: PortfolioData | null;
    __lastPortfolioCacheTime?: number;
};

const CACHE_TTL_MS = 2 * 1000; // 2 seconds TTL for real-time responsiveness

export function invalidatePortfolioCache() {
    globalPortfolioCache.__cachedPortfolio = null;
    globalPortfolioCache.__lastPortfolioCacheTime = 0;
}

/**
 * Fetch full portfolio data assembled from normalized relational tables.
 * Falls back to local portfolio-db.json if database is unseeded.
 */
export async function getNormalizedPortfolio(): Promise<PortfolioData> {
    const now = Date.now();
    if (globalPortfolioCache.__cachedPortfolio && now - (globalPortfolioCache.__lastPortfolioCacheTime || 0) < CACHE_TTL_MS) {
        return globalPortfolioCache.__cachedPortfolio;
    }

    try {
        const user = await prisma.user.findFirst({
            include: {
                experiences: { orderBy: { order: "asc" } },
                education: { orderBy: { order: "asc" } },
                courses: { orderBy: { order: "asc" } },
            },
        });

        if (!user) {
            return fallbackDb as unknown as PortfolioData;
        }

        const projects = await prisma.project.findMany({
            orderBy: { order: "asc" },
            include: {
                category: true,
                images: { orderBy: { order: "asc" } },
                features: { orderBy: { order: "asc" } },
                variants: { orderBy: { order: "asc" } },
                techStacks: {
                    orderBy: { order: "asc" },
                    include: { techStack: true },
                },
            },
        });

        const skillGroups = await prisma.skillGroup.findMany({
            orderBy: { order: "asc" },
            include: {
                items: {
                    orderBy: { order: "asc" },
                    include: { techStack: true },
                },
            },
        });

        const formattedProjects = projects.map((p, index) => {
            const gallery = p.images.map((img) => img.url);
            const allImages = gallery.length > 0 ? gallery : p.coverImage ? [p.coverImage] : [];
            const coverImage = allImages.length > 0 ? allImages[0] : p.coverImage || "";

            return {
                id: String(index + 1).padStart(2, "0"),
                slug: p.slug,
                title: p.title,
                tagline: p.tagline,
                stack: p.stack,
                description: p.description,
                longDescription: p.longDescription,
                image: coverImage,
                images: allImages,
                links: {
                    live: p.liveUrl,
                    code: p.codeUrl,
                },
                cta: p.cta,
                category: p.category.label,
                role: p.role,
                duration: p.duration,
                client: p.client,
                status: p.status,
                featured: p.featured,
                features: p.features.map((f) => f.text),
                variants: Array.isArray(p.variants)
                    ? p.variants.map((v) => ({
                          id: v.id,
                          name: v.name,
                          badge: v.badge,
                          previewImage: v.previewImage,
                          liveUrl: v.liveUrl,
                          order: v.order,
                      }))
                    : [],
                tech: p.techStacks.map((pt) => ({
                    name: pt.techStack.name,
                    category: pt.techStack.role,
                    iconUrl: pt.techStack.iconUrl,
                })),
            };
        });

        const formattedSkills = skillGroups.map((sg) => ({
            category: sg.label,
            items: sg.items.map((item) => ({
                name: item.techStack.name,
                url: item.techStack.iconUrl || "",
            })),
        }));

        // Load latest custom fields from portfolio-db.json safely
        let localDbAbout: any = (fallbackDb as any).about || {};
        let localDbResumeUrl = fallbackDb.resumeUrl;
        try {
            const fs = await import("fs/promises");
            const path = await import("path");
            const filePath = path.join(process.cwd(), "src", "lib", "portfolio-db.json");
            const raw = await fs.readFile(filePath, "utf-8");
            const parsed = JSON.parse(raw);
            if (parsed.about) localDbAbout = parsed.about;
            if (parsed.resumeUrl) localDbResumeUrl = parsed.resumeUrl;
            else if (parsed.about?.resumeUrl) localDbResumeUrl = parsed.about.resumeUrl;
        } catch {}

        const assembled: PortfolioData = {
            name: user.fullName,
            firstName: user.firstName,
            title: user.title,
            role: user.role,
            location: user.location,
            email: user.email,
            phone: user.phone || "",
            timezone: user.timezone || "",
            availability: user.availability,
            responseTime: user.responseTime,
            resumeUrl: localDbResumeUrl || localDbAbout?.resumeUrl || "/resume.pdf",
            socials: {
                github: user.githubUrl,
                linkedin: user.linkedinUrl,
                twitter: user.twitterUrl || "",
                portfolio3d: fallbackDb.portfolio3d || "https://3d.mahdimonir.dev",
            },
            hero: {
                headline: user.heroHeadline,
                headlineSecond: user.heroHeadlineSecond,
                subheadline: user.heroSubheadline,
                availability: user.heroAvailability,
            },
            about: {
                label: user.aboutLabel,
                education: user.education.map((e) => ({
                    degree: e.degree,
                    institution: e.institution,
                    period: e.period,
                    current: e.current,
                })),
                experience: user.experiences.map((exp) => ({
                    company: exp.company,
                    role: exp.role,
                    period: exp.period,
                    location: exp.location,
                    current: exp.current,
                    companyUrl: exp.companyUrl,
                    companyLogo: exp.companyLogo,
                    description: exp.description,
                    achievements: exp.achievements,
                })),
                courses: user.courses.map((c) => ({
                    title: c.title,
                    institution: c.institution,
                    period: c.period,
                    certificateUrl: c.certificateUrl,
                    completed: c.completed,
                })),
                focus: user.focus,
                summary: localDbAbout.summary || (fallbackDb.about as any).summary || user.heroSubheadline,
                avatarUrl: localDbAbout.avatarUrl || "/Moniruzzaman_Mahdi.png",
                resumeUrl: localDbResumeUrl || localDbAbout?.resumeUrl || "/resume.pdf",
                topBackLabel: localDbAbout.topBackLabel || "Back To Home",
                topResumeLabel: localDbAbout.topResumeLabel || "Download Resume",
                topContactLabel: localDbAbout.topContactLabel || "Initiate Contact",
                portraitTag: localDbAbout.portraitTag || "ENGINEERING DOSSIER",
                portraitStatus: localDbAbout.portraitStatus || "STATUS: ACTIVE",
                websiteUrl: localDbAbout.websiteUrl || "https://mahdimonir.dev",
                experienceBadge: localDbAbout.experienceBadge || "01 // CAREER",
                experienceHeading: localDbAbout.experienceHeading || "Work Experience",
                experienceDescription:
                    localDbAbout.experienceDescription ||
                    "Production track record across software engineering, client platforms, and high-concurrency systems.",
                projectsBadge: localDbAbout.projectsBadge || "02 // SYSTEMS",
                projectsHeading: localDbAbout.projectsHeading || "Flagship Systems",
                projectsDescription:
                    localDbAbout.projectsDescription ||
                    "Production web platforms, SaaS multi-tenancy, and high-performance engines built end-to-end.",
                projectsArchiveLabel: localDbAbout.projectsArchiveLabel || "Archive",
                skillsBadge: localDbAbout.skillsBadge || "03 // CAPABILITIES",
                skillsHeading: localDbAbout.skillsHeading || "Technical Stack",
                skillsDescription:
                    localDbAbout.skillsDescription ||
                    "Languages, backend frameworks, relational databases, cloud infrastructure, and tool ecosystem.",
                specializationsBadge: localDbAbout.specializationsBadge || "04 // SPECIALIZATIONS",
                specializationsHeading: localDbAbout.specializationsHeading || "Engineering Specializations",
                specializationsDescription:
                    localDbAbout.specializationsDescription ||
                    "In-depth architectural competencies, multi-tenant engineering, rapid zero-to-one MVP delivery, and high-concurrency data systems.",
                credentialsBadge: localDbAbout.credentialsBadge || "05 // CREDENTIALS",
                credentialsHeading: localDbAbout.credentialsHeading || "Education & Certifications",
                credentialsDescription:
                    localDbAbout.credentialsDescription || "Formal academic background, verified industry courses, and cohort training.",
                educationHeading: localDbAbout.educationHeading || "Formal Education",
                coursesHeading: localDbAbout.coursesHeading || "Certifications & Cohorts",
                ctaLabel: localDbAbout.ctaLabel || "// LET'S COLLABORATE",
                ctaHeading: localDbAbout.ctaHeading || "Have an architecture or system to build?",
                ctaDescription:
                    localDbAbout.ctaDescription ||
                    "Available for high-impact full-stack roles, system architecture consulting, and rapid MVP engineering.",
                ctaResumeButtonText: localDbAbout.ctaResumeButtonText || "Download PDF Resume",
                ctaContactButtonText: localDbAbout.ctaContactButtonText || "Initiate Contact",
                specializations: parseSpecializations(
                    user.focus,
                    localDbAbout.specializations || (fallbackDb.about as any).specializations,
                ),
            },
            projects:
                formattedProjects.length > 0
                    ? formattedProjects
                    : (fallbackDb.projects as unknown as PortfolioData["projects"]).map((p, idx) => ({
                          ...p,
                          id: String(idx + 1).padStart(2, "0"),
                      })),
            skills: formattedSkills.length > 0 ? formattedSkills : (fallbackDb.skills as unknown as PortfolioData["skills"]),
            quote: {
                text: user.quoteText || fallbackDb.quote.text,
                author: user.quoteAuthor || fallbackDb.quote.author,
            },
        };

        globalPortfolioCache.__cachedPortfolio = assembled;
        globalPortfolioCache.__lastPortfolioCacheTime = Date.now();
        return assembled;
    } catch (error) {
        console.error("Error reading normalized portfolio from DB, using fallback:", error);
        const fallbackResult: PortfolioData = {
            ...(fallbackDb as unknown as PortfolioData),
            about: {
                ...(fallbackDb.about as any),
                specializations: (fallbackDb.about as any).specializations || [],
            },
            projects: (fallbackDb.projects as unknown as PortfolioData["projects"]).map((p, idx) => ({
                ...p,
                id: String(idx + 1).padStart(2, "0"),
            })),
        };
        globalPortfolioCache.__cachedPortfolio = fallbackResult;
        globalPortfolioCache.__lastPortfolioCacheTime = Date.now();
        return fallbackResult;
    }
}

function parseSpecializations(userFocus: string[], fallbackSpecs?: any[]): any[] {
    const fallback = Array.isArray(fallbackSpecs) ? fallbackSpecs : [];
    if (!Array.isArray(userFocus) || userFocus.length === 0) {
        return fallback;
    }

    // If userFocus already has JSON-serialized specializations from dashboard:
    const hasSerializedSpecs = userFocus.some((item) => typeof item === "string" && item.trim().startsWith("{"));

    if (hasSerializedSpecs) {
        const parsed: any[] = [];
        for (const item of userFocus) {
            if (typeof item === "string" && item.trim().startsWith("{")) {
                try {
                    const obj = JSON.parse(item);
                    if (obj && obj.title) {
                        parsed.push({
                            id: obj.id || `spec-${parsed.length + 1}`,
                            title: obj.title,
                            description: obj.description || "",
                            skills: Array.isArray(obj.skills) ? obj.skills : [],
                            points: Array.isArray(obj.points) ? obj.points : [],
                        });
                    }
                } catch {}
            }
        }
        if (parsed.length > 0) return parsed;
    }

    // Legacy fallback matching
    const parsedItems: any[] = [];
    for (const item of userFocus) {
        const itemLower = typeof item === "string" ? item.toLowerCase() : "";
        const matched = fallback.find((f) => {
            const fLower = (f.title || "").toLowerCase();
            return (
                fLower === itemLower ||
                fLower.includes(itemLower) ||
                itemLower.includes(fLower) ||
                (fLower.includes("mvp") && itemLower.includes("mvp")) ||
                (fLower.includes("saas") && itemLower.includes("saas")) ||
                (fLower.includes("api") && itemLower.includes("api")) ||
                (fLower.includes("database") && itemLower.includes("database"))
            );
        });

        if (matched) {
            parsedItems.push(matched);
        } else if (typeof item === "string" && item.trim()) {
            parsedItems.push({
                id: `spec-${parsedItems.length + 1}`,
                title: item,
                description:
                    "Core architectural capability executed with strict type safety, modular service boundaries, and performance optimization.",
                skills: ["TypeScript", "Next.js", "PostgreSQL", "Docker"],
                points: ["Engineered for production reliability and predictable system behavior"],
            });
        }
    }

    if (fallback.length > 0) {
        for (const fb of fallback) {
            if (!parsedItems.some((p) => p.title.toLowerCase() === fb.title.toLowerCase())) {
                parsedItems.push(fb);
            }
        }
    }

    return parsedItems.length > 0 ? parsedItems : fallback;
}

/**
 * Fetch all projects cleanly for project list views.
 */
export async function getProjects(): Promise<ProjectItem[]> {
    try {
        const portfolio = await getNormalizedPortfolio();
        return portfolio.projects;
    } catch (error) {
        console.error("Error in getProjects:", error);
        return (fallbackDb.projects as unknown as ProjectItem[]).map((p, idx) => ({
            ...p,
            id: String(idx + 1).padStart(2, "0"),
        }));
    }
}

/**
 * Fetch a single project by its slug.
 */
export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
    try {
        const projects = await getProjects();
        const found = projects.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
        return found || null;
    } catch (error) {
        console.error(`Error in getProjectBySlug for ${slug}:`, error);
        return null;
    }
}
