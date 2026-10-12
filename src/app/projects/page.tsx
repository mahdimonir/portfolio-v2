import { Metadata } from "next";
import { getProjects } from "@/lib/portfolio-service";
import ProjectsView from "./ProjectsView";
import { ProjectData } from "./[slug]/ProjectDetailView";

export const revalidate = 60;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahdimonir.dev";

export const metadata: Metadata = {
    title: "Selected Works & Architecture Systems",
    description:
        "Explore 9 production-grade full-stack web applications, scalable SaaS architectures, enterprise ERP systems, and custom CMS engines built with Next.js, NestJS, Go, and PostgreSQL by Moniruzzaman Mahdi (@mahdimonir).",
    keywords: [
        "mahdi",
        "mahdimonir",
        "Mahdi Monir",
        "Moniruzzaman Mahdi",
        "Full Stack Projects",
        "Next.js Applications",
        "NestJS Microservices",
        "SaaS MVP Architecture",
        "Enterprise ERP Systems",
        "Custom CMS Platforms",
        "Golang Backend",
        "PERN Stack Projects",
        "MERN Stack Projects",
        "Software Architecture Case Studies",
        "Full Stack Developer Portfolio",
    ],
    alternates: {
        canonical: "/projects",
    },
    openGraph: {
        title: "Selected Works & Architecture Systems — Moniruzzaman Mahdi",
        description:
            "Explore 9 production-grade full-stack web applications, scalable SaaS architectures, enterprise ERP systems, and custom CMS engines built with Next.js, NestJS, Go, and PostgreSQL by Moniruzzaman Mahdi (@mahdimonir / Mahdi).",
        url: `${baseUrl}/projects`,
        type: "website",
        siteName: "Moniruzzaman Mahdi",
        images: [
            {
                url: "/opengraph-image",
                width: 1200,
                height: 630,
                alt: "Selected Works & Software Architecture — Moniruzzaman Mahdi",
            },
            {
                url: "/Moniruzzaman_Mahdi.png",
                width: 1200,
                height: 1500,
                alt: "Moniruzzaman Mahdi (mahdimonir / Mahdi) — Full Stack Developer & Software Architect",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@Mahdimonir2004",
        creator: "@Mahdimonir2004",
        title: "Selected Works & Architecture Systems — Moniruzzaman Mahdi",
        description:
            "Explore 9 production-grade full-stack web applications, scalable SaaS architectures, enterprise ERP systems, and custom CMS engines built with Next.js, NestJS, Go, and PostgreSQL by Moniruzzaman Mahdi.",
        images: ["/opengraph-image"],
    },
};

export default async function ProjectsPage() {
    const projects = (await getProjects()) as unknown as ProjectData[];

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Selected Works & Architecture Systems — Moniruzzaman Mahdi",
        description:
            "Complete archive of full-stack applications, enterprise platforms, and software architecture by Moniruzzaman Mahdi (@mahdimonir / Mahdi).",
        url: `${baseUrl}/projects`,
        author: {
            "@type": "Person",
            name: "Moniruzzaman Mahdi",
            alternateName: ["mahdi", "mahdimonir", "Mahdi", "Mahdi Monir"],
            url: baseUrl,
        },
        mainEntity: {
            "@type": "ItemList",
            itemListElement: projects.map((project, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `${baseUrl}/projects/${project.slug}`,
                name: project.title,
                description: project.description,
                image: {
                    "@type": "ImageObject",
                    contentUrl: project.image && !project.image.startsWith("REPLACE_WITH") ? project.image : `${baseUrl}/preview.png`,
                    name: `${project.title} — Application Screenshot by Moniruzzaman Mahdi`,
                    author: "Moniruzzaman Mahdi",
                },
            })),
        },
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
            <ProjectsView projects={projects} />
        </>
    );
}
