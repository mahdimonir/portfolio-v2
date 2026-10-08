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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | Moniruzzaman Mahdi",
    };
  }

  return {
    title: `${project.title} — Case Study | Moniruzzaman Mahdi`,
    description: project.description,
    openGraph: {
      title: `${project.title} — Case Study`,
      description: project.description,
      images: [{ url: project.image }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — Case Study`,
      description: project.description,
      images: [project.image],
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

  return (
    <ProjectDetailView
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
      position={currentIndex + 1}
    />
  );
}
