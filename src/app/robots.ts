import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahdimonir.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/projects", "/projects/*", "/llms.txt", "/llms-full.txt"],
        disallow: ["/dashboard", "/dashboard/*", "/api", "/api/*", "/login"],
      },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "PerplexityBot",
          "Applebot-Extended",
          "Google-Extended",
          "CCBot",
          "OAI-SearchBot",
          "anthropic-ai",
        ],
        allow: ["/", "/about", "/projects", "/projects/*", "/llms.txt", "/llms-full.txt"],
        disallow: ["/dashboard", "/dashboard/*", "/api", "/api/*", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
