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
        default: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect",
        template: "%s — Moniruzzaman Mahdi",
    },
    description:
        "Official portfolio of Moniruzzaman Mahdi (@mahdimonir / Mahdi) — Senior Full Stack Developer & Software Architect specializing in Next.js, React, Node.js, NestJS, Go, and PostgreSQL. Engineering production web applications, SaaS MVPs, enterprise ERP systems, and cloud API microservices.",
    applicationName: "Moniruzzaman Mahdi",
    authors: [
        { name: "Moniruzzaman Mahdi", url: baseUrl },
        { name: "Mahdi", url: baseUrl },
        { name: "mahdimonir", url: "https://github.com/mahdimonir" },
        { name: "Mahdi Monir", url: baseUrl },
        { name: "MD Moniruzzaman", url: baseUrl },
    ],
    creator: "Moniruzzaman Mahdi (@mahdimonir)",
    publisher: "Moniruzzaman Mahdi",
    category: "technology",
    keywords: [
        // --- Direct Search Queries & Entity Matches ---
        "mahdi",
        "mahdimonir",
        "Mahdi Monir",
        "mahdi dev",
        "mahdimonir dev",
        "devmahdi",
        "Moniruzzaman",
        "Moniruzzaman Mahdi",
        "MD Moniruzzaman",
        "Mahdi Moniruzzaman",
        "MAHDI®",
        "mahdimonir.dev",
        "mahdi developer",
        "mahdimonir portfolio",
        "mahdimonir github",

        // --- Roles & Professional Titles ---
        "Full Stack Developer",
        "Full Stack Engineer",
        "Full Stack Architect",
        "Software Engineer",
        "Software Architect",
        "Software Developer",
        "Backend Developer",
        "Backend Engineer",
        "Backend Architect",
        "Frontend Developer",
        "Frontend Engineer",
        "Next.js Developer",
        "Next.js Architect",
        "React Developer",
        "Node.js Developer",
        "Node.js Backend Engineer",
        "NestJS Developer",
        "NestJS Architect",
        "Go Developer",
        "Golang Developer",
        "Golang Backend Engineer",
        "PERN Stack Developer",
        "PERN Stack Architect",
        "MERN Stack Developer",
        "MERN Stack Architect",
        "SaaS Developer",
        "SaaS Architect",
        "SaaS Platform Engineer",
        "MVP Developer",
        "ERP Developer",
        "ERP Architect",
        "CMS Developer",
        "Product Engineer",
        "System Architect",
        "API Architect",
        "Web Developer Bangladesh",
        "Software Engineer Bangladesh",
        "Chattogram Developer",
        "Dhaka Developer",
        "Remote Full Stack Developer",
        "Contract Software Engineer",
        "Freelance Full Stack Developer",

        // --- Services & Solutions Offered ---
        "Full Stack Web Development Services",
        "SaaS Platform Development",
        "SaaS MVP Rapid Prototyping",
        "MVP Prototyping Services",
        "Zero-to-One Product Development",
        "Custom ERP Development",
        "Enterprise ERP Systems",
        "Custom CMS Development",
        "Headless CMS Architecture",
        "RESTful API Architecture",
        "WebSocket Real-Time Architecture",
        "NestJS Backend Development",
        "Go Microservices Development",
        "Next.js Web Applications",
        "React 19 Application Development",
        "PostgreSQL Database Architecture",
        "Prisma ORM Development",
        "Database Performance Optimization",
        "AI Agent Integration",
        "OpenAI API Integration",
        "Hire Next.js Developer",
        "Hire Full Stack Engineer",
        "Hire Software Architect",
        "Software Engineering Consulting",

        // --- Core Tech Stack ---
        "Next.js 16",
        "React 19",
        "TypeScript",
        "Node.js",
        "NestJS",
        "Go",
        "Golang",
        "PostgreSQL",
        "Neon Serverless Postgres",
        "Prisma ORM",
        "MongoDB",
        "Redis",
        "Docker",
        "Tailwind CSS",
        "Framer Motion",
        "Stripe Integration",
        "SSLCommerz",
    ],
    alternates: {
        canonical: "/",
        types: {
            "text/plain": [
                { url: "/llms.txt", title: "LLM Dossier (Summary)" },
                { url: "/llms-full.txt", title: "LLM Dossier (Full Specification)" },
            ],
        },
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
        siteName: "Moniruzzaman Mahdi",
        title: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect",
        description:
            "Production web applications, SaaS MVPs, enterprise ERP systems, and cloud API microservices by Moniruzzaman Mahdi (@mahdimonir / Mahdi). Specializing in Next.js, NestJS, Go, and PostgreSQL.",
        images: [
            {
                url: "/Moniruzzaman_Mahdi.png",
                width: 1200,
                height: 1500,
                alt: "Moniruzzaman Mahdi (mahdimonir / Mahdi) — Full Stack Developer Portrait",
            },
            {
                url: "/Moniruzzaman_Mahdi.png",
                width: 1200,
                height: 1500,
                alt: "Moniruzzaman Mahdi (@mahdimonir) Portrait",
            },
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
            "Full Stack Developer & Software Architect specializing in Next.js, NestJS, Go, PostgreSQL, SaaS MVPs, enterprise ERP systems, and cloud APIs.",
        images: ["/Moniruzzaman_Mahdi.png", "/opengraph-image"],
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
