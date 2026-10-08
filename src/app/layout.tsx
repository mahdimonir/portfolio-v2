import type { Metadata, Viewport } from "next";
import { playfair, inter } from "@/lib/fonts";
import "./globals.css";
import "lenis/dist/lenis.css";
import Providers from "@/components/Providers";
import StructuredData from "@/components/StructuredData";
import PublicLoadingBar from "@/components/PublicLoadingBar";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahdimonir.dev";

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect | Next.js, NestJS, Go, PERN & MERN",
    template: "%s | Moniruzzaman Mahdi",
  },
  description:
    "Moniruzzaman Mahdi (MAHDI®) — Senior Full Stack Developer & Software Architect specializing in Next.js, React, Node.js, NestJS, Go (Golang), and PostgreSQL. Expert in MVP rapid prototyping, scalable SaaS engineering, enterprise ERP systems, custom CMS, and high-performance PERN & MERN stack architectures.",
  applicationName: "Moniruzzaman Mahdi Portfolio",
  authors: [{ name: "Moniruzzaman Mahdi", url: baseUrl }],
  creator: "Moniruzzaman Mahdi",
  publisher: "Moniruzzaman Mahdi",
  category: "technology",
  keywords: [
    "Moniruzzaman Mahdi",
    "Mahdi Monir",
    "MAHDI®",
    "Full Stack Developer",
    "Full Stack Engineer",
    "Full Stack Architect",
    "Software Engineer",
    "Software Architect",
    "Software Developer",
    "Web Developer",
    "Web Application Developer",
    "MVP Developer",
    "MVP Development",
    "Prototype Developer",
    "Rapid Prototyping",
    "SaaS Developer",
    "SaaS Architect",
    "SaaS Platform Engineer",
    "ERP Developer",
    "ERP Architect",
    "Enterprise Resource Planning",
    "CMS Developer",
    "Custom CMS",
    "Headless CMS Developer",
    "Product Engineer",
    "Product Developer",
    "Next.js Developer",
    "Next.js 16",
    "React Developer",
    "React 19",
    "Node.js Developer",
    "Node.js Backend Engineer",
    "NestJS Developer",
    "NestJS Architect",
    "Go Developer",
    "Golang Developer",
    "Golang Backend Engineer",
    "PERN Stack Developer",
    "PERN Stack Engineer",
    "PERN Stack Architect",
    "MERN Stack Developer",
    "MERN Stack Engineer",
    "MERN Stack Architect",
    "TypeScript Specialist",
    "PostgreSQL Developer",
    "Prisma ORM",
    "MongoDB Developer",
    "Redis Caching",
    "Docker Containerization",
    "RESTful API Architecture",
    "WebSocket Architecture",
    "System Design",
    "Web Developer Bangladesh",
    "Dhaka",
    "Chattogram",
    "Remote Full Stack Developer",
    "Contract Software Engineer",
    "Freelance Full Stack Developer",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect",
    title: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect | Next.js, NestJS, Go, PERN & MERN",
    description:
      "Full Stack Developer & Software Architect building high-performance web applications, scalable SaaS MVPs, enterprise ERPs, and custom CMS platforms with Next.js, NestJS, Golang, and PostgreSQL.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Mahdimonir2004",
    creator: "@Mahdimonir2004",
    title: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect",
    description:
      "Full Stack Developer & Software Architect specializing in Next.js, NestJS, Go, PERN & MERN stacks, SaaS MVPs, and enterprise ERP systems.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <PublicLoadingBar />
        <StructuredData />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
