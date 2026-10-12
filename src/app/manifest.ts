import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect",
        short_name: "Moniruzzaman Mahdi",
        description:
            "Official portfolio and engineering case studies of Moniruzzaman Mahdi (@mahdimonir / Mahdi) — Full Stack Developer & Software Architect specializing in Next.js, NestJS, Go, and PostgreSQL.",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
        ],
    };
}
