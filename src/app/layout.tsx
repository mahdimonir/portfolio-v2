import type { Metadata, Viewport } from "next";
import { playfair, inter } from "@/lib/fonts";
import "./globals.css";
import "lenis/dist/lenis.css";
import Providers from "@/components/Providers";
import StructuredData from "@/components/StructuredData";

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
    template: "%s | Moniruzzaman Mahdi",
  },
  description:
    "Full Stack Developer specializing in production-ready web platforms, robust backend APIs, and scalable architectures using React, Next.js, TypeScript, Node.js, and PostgreSQL.",
  applicationName: "Moniruzzaman Mahdi Portfolio",
  authors: [{ name: "Moniruzzaman Mahdi", url: baseUrl }],
  creator: "Moniruzzaman Mahdi",
  publisher: "Moniruzzaman Mahdi",
  category: "technology",
  keywords: [
    "Moniruzzaman Mahdi",
    "Mahdi Monir",
    "Full Stack Developer",
    "Software Engineer",
    "React Developer",
    "Next.js Developer",
    "TypeScript",
    "Node.js",
    "NestJS",
    "PostgreSQL",
    "Prisma ORM",
    "Docker",
    "Web Developer Bangladesh",
    "Chattogram",
    "Dhaka",
    "Portfolio",
    "Interactive Web Design",
    "Tailwind CSS",
    "RESTful API Architecture",
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
    siteName: "Moniruzzaman Mahdi Portfolio",
    title: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect",
    description:
      "Driven by logic. Building robust software, automating the complex, and transforming static systems into intelligent digital platforms.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Moniruzzaman Mahdi — Full Stack Developer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Mahdimonir2004",
    creator: "@Mahdimonir2004",
    title: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect",
    description:
      "Driven by logic. Building robust software, automating the complex, and transforming static systems into intelligent digital platforms.",
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
        <StructuredData />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
