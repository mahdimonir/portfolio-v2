import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/portfolio-service";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // revalidate at most once every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahdimonir.dev";

    let projectEntries: MetadataRoute.Sitemap = [];
    let allProjectImages: string[] = [];
    try {
        const projects = await getProjects();
        allProjectImages = projects.map((p) => p.image).filter((img): img is string => Boolean(img && !img.startsWith("REPLACE_WITH")));

        projectEntries = projects.map((p) => {
            const pImages: string[] = [];
            if (p.image && !p.image.startsWith("REPLACE_WITH")) {
                pImages.push(p.image);
            }
            if (Array.isArray(p.images)) {
                p.images.forEach((img) => {
                    if (img && !img.startsWith("REPLACE_WITH") && !pImages.includes(img)) {
                        pImages.push(img);
                    }
                });
            }
            return {
                url: `${baseUrl}/projects/${p.slug}`,
                lastModified: new Date(),
                changeFrequency: "weekly" as const,
                priority: p.featured ? 0.85 : 0.75,
                images: pImages.length > 0 ? pImages : undefined,
            };
        });
    } catch (error) {
        console.error("Error generating dynamic sitemap for projects:", error);
    }

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 1.0,
            images: [
                `${baseUrl}/Moniruzzaman_Mahdi.png`,
                `${baseUrl}/mahdimonir.png`,
                `${baseUrl}/mahdi.png`,
                `${baseUrl}/preview.png`,
                `${baseUrl}/opengraph-image`,
            ],
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.95,
            images: [
                `${baseUrl}/Moniruzzaman_Mahdi.png`,
                `${baseUrl}/mahdimonir.png`,
                `${baseUrl}/mahdi.png`,
                `${baseUrl}/preview.png`,
                `${baseUrl}/opengraph-image`,
            ],
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.9,
            images: allProjectImages.length > 0 ? allProjectImages : [`${baseUrl}/opengraph-image`],
        },
        ...projectEntries,
    ];
}
