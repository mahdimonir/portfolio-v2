import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjects, getProjectBySlug } from "@/lib/portfolio-service";
import ProjectDetailView, { ProjectData } from "./ProjectDetailView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahdimonir.dev";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | Moniruzzaman Mahdi",
    };
  }

  const projectUrl = `${baseUrl}/projects/${project.slug}`;
  const techNames = Array.isArray(project.tech)
    ? project.tech.map((t: any) => (typeof t === "string" ? t : t.name))
    : [];

  const safeImage = project.image && !project.image.startsWith("REPLACE_WITH") ? project.image : `${baseUrl}/preview.png`;

  return {
    title: `${project.title} — Case Study | Moniruzzaman Mahdi`,
    description: project.description,
    keywords: [
      project.title,
      project.category || "Full Stack",
      ...techNames,
      "Full Stack Development",
      "Software Architecture",
      "SaaS MVP",
      "ERP System",
      "Custom CMS",
      "PERN Stack",
      "MERN Stack",
      "Case Study",
      "Moniruzzaman Mahdi",
    ],
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      type: "article",
      url: projectUrl,
      siteName: "Moniruzzaman Mahdi Portfolio",
      title: `${project.title} — Case Study | Moniruzzaman Mahdi`,
      description: project.description,
      images: [
        {
          url: safeImage,
          width: 1200,
          height: 630,
          alt: `${project.title} project screenshot and case study`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@Mahdimonir2004",
      creator: "@Mahdimonir2004",
      title: `${project.title} — Case Study | Moniruzzaman Mahdi`,
      description: project.description,
      images: [safeImage],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const projects = await getProjects();
  const currentIndex = projects.findIndex(
    (p) => p.slug.toLowerCase() === slug.toLowerCase()
  );

  if (currentIndex === -1) {
    notFound();
  }

  const project = projects[currentIndex] as unknown as ProjectData;
  const prevProject = (currentIndex > 0 ? projects[currentIndex - 1] : null) as unknown as ProjectData | null;
  const nextProject = (currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null) as unknown as ProjectData | null;

  const projectUrl = `${baseUrl}/projects/${project.slug}`;
  const techNames = Array.isArray(project.tech)
    ? project.tech.map((t: any) => (typeof t === "string" ? t : t.name)).join(", ")
    : project.stack;

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    headline: project.tagline || project.title,
    description: project.description,
    applicationCategory: "WebApplication",
    operatingSystem: "Web",
    image: project.image,
    url: projectUrl,
    author: {
      "@type": "Person",
      name: "Moniruzzaman Mahdi",
      url: baseUrl,
    },
    creator: {
      "@type": "Person",
      name: "Moniruzzaman Mahdi",
    },
    keywords: techNames,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${baseUrl}/projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: projectUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProjectDetailView
        project={project}
        prevProject={prevProject}
        nextProject={nextProject}
        position={currentIndex + 1}
      />
    </>
  );
}
