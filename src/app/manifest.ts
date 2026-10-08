import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Moniruzzaman Mahdi — Full Stack Developer",
    short_name: "Mahdi Portfolio",
    description:
      "Portfolio of Moniruzzaman Mahdi — Full Stack Developer engineering robust architectures, high-performance web applications, and modern digital platforms.",
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
