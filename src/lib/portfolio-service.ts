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

// High-speed in-memory cache for ultra-fast instant page transitions (0ms)
let cachedPortfolio: PortfolioData | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidatePortfolioCache() {
  cachedPortfolio = null;
  lastCacheTime = 0;
}

/**
 * Fetch full portfolio data assembled from normalized relational tables.
 * Falls back to local portfolio-db.json if database is unseeded.
 */
export async function getNormalizedPortfolio(): Promise<PortfolioData> {
  const now = Date.now();
  if (cachedPortfolio && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedPortfolio;
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
      const coverImage = allImages.length > 0 ? allImages[0] : (p.coverImage || "");

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
      socials: {
        github: user.githubUrl,
        linkedin: user.linkedinUrl,
        twitter: user.twitterUrl || "",
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
      },
      projects: (() => {
        const dbSlugs = new Set(formattedProjects.map((p) => p.slug.toLowerCase()));
        const missingFromDb = (fallbackDb.projects as unknown as PortfolioData["projects"]).filter(
          (p) => !dbSlugs.has(p.slug.toLowerCase())
        );
        return [...formattedProjects, ...missingFromDb].map((p, idx) => ({
          ...p,
          id: String(idx + 1).padStart(2, "0"),
        }));
      })(),
      skills: formattedSkills.length > 0 ? formattedSkills : (fallbackDb.skills as unknown as PortfolioData["skills"]),
      quote: {
        text: user.quoteText || fallbackDb.quote.text,
        author: user.quoteAuthor || fallbackDb.quote.author,
      },
    };

    cachedPortfolio = assembled;
    lastCacheTime = Date.now();
    return assembled;
  } catch (error) {
    console.error("Error reading normalized portfolio from DB, using fallback:", error);
    const fallbackResult: PortfolioData = {
      ...(fallbackDb as unknown as PortfolioData),
      projects: (fallbackDb.projects as unknown as PortfolioData["projects"]).map((p, idx) => ({
        ...p,
        id: String(idx + 1).padStart(2, "0"),
      })),
    };
    cachedPortfolio = fallbackResult;
    lastCacheTime = Date.now();
    return fallbackResult;
  }
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
    if (found) return found;

    const fallback = (fallbackDb.projects as unknown as ProjectItem[]).find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase()
    );
    return fallback ? { ...fallback, id: String(fallbackDb.projects.indexOf(fallback as any) + 1).padStart(2, "0") } : null;
  } catch (error) {
    console.error(`Error in getProjectBySlug for ${slug}:`, error);
    const fallback = (fallbackDb.projects as unknown as ProjectItem[]).find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase()
    );
    return fallback ? { ...fallback, id: String(fallbackDb.projects.indexOf(fallback as any) + 1).padStart(2, "0") } : null;
  }
}
