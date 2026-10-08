import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect",
    short_name: "MAHDI®",
    description:
      "Portfolio of Moniruzzaman Mahdi — Full Stack Developer & Software Architect specializing in Next.js, NestJS, Go, PERN & MERN stacks, SaaS MVPs, ERP, and custom CMS platforms.",
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
