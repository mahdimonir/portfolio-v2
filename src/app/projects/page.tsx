import { Metadata } from "next";
import { getProjects } from "@/lib/portfolio-service";
import ProjectsView from "./ProjectsView";
import { ProjectData } from "./[slug]/ProjectDetailView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects & Architecture | Moniruzzaman Mahdi",
  description:
    "Explore the complete portfolio of web applications, scalable full-stack architectures, and production-ready platforms built by Moniruzzaman Mahdi.",
  openGraph: {
    title: "Projects & Architecture | Moniruzzaman Mahdi",
    description:
      "Explore the complete portfolio of web applications, scalable full-stack architectures, and production-ready platforms.",
  },
};

export default async function ProjectsPage() {
  const projects = (await getProjects()) as unknown as ProjectData[];

  return <ProjectsView projects={projects} />;
}
