import { Metadata } from "next";
import { getProjects } from "@/lib/portfolio-service";
import ProjectsView from "./ProjectsView";
import { ProjectData } from "./[slug]/ProjectDetailView";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahdimonir.dev";

export const metadata: Metadata = {
  title: "Projects & Architecture | Moniruzzaman Mahdi",
  description:
    "Explore the complete portfolio of web applications, scalable full-stack architectures, and production-ready platforms built by Moniruzzaman Mahdi.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects & Architecture | Moniruzzaman Mahdi",
    description:
      "Explore the complete portfolio of web applications, scalable full-stack architectures, and production-ready platforms built by Moniruzzaman Mahdi.",
    url: `${baseUrl}/projects`,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Projects & Architecture — Moniruzzaman Mahdi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects & Architecture | Moniruzzaman Mahdi",
    description:
      "Explore the complete portfolio of web applications, scalable full-stack architectures, and production-ready platforms built by Moniruzzaman Mahdi.",
    images: ["/opengraph-image"],
  },
};

export default async function ProjectsPage() {
  const projects = (await getProjects()) as unknown as ProjectData[];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Projects & Architecture — Moniruzzaman Mahdi",
    description: "Complete archive of full-stack applications, enterprise platforms, and software architecture by Moniruzzaman Mahdi.",
    url: `${baseUrl}/projects`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}/projects/${project.slug}`,
        name: project.title,
        description: project.description,
        image: project.image,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <ProjectsView projects={projects} />
    </>
  );
}
