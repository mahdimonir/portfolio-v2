import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mahdi (Moniruzzaman Mahdi / mahdimonir) — Full Stack Developer & Software Architect",
    short_name: "Mahdi Monir",
    description:
      "Official portfolio and engineering case studies of Mahdi (Moniruzzaman Mahdi / @mahdimonir) — Full Stack Developer & Software Architect specializing in Next.js, NestJS, Go, PERN & MERN stacks, SaaS MVPs, and enterprise systems.",
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
