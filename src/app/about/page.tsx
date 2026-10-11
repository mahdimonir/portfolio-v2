import { Metadata } from "next";
import { getNormalizedPortfolio } from "@/lib/portfolio-service";
import AboutView from "./AboutView";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahdimonir.dev";

export const metadata: Metadata = {
  title: "About Moniruzzaman Mahdi (Mahdi Monir / mahdimonir) — Full Stack Developer & Software Architect",
  description:
    "Explore the complete biography, work track record at Kodevio Limited & Rank Nexis, academic education, certified credentials, and technical architecture specializations of Moniruzzaman Mahdi (Mahdi Monir / @mahdimonir).",
  keywords: [
    "About Mahdi",
    "About Moniruzzaman Mahdi",
    "Mahdi Monir Biography",
    "mahdimonir",
    "Moniruzzaman",
    "MD Moniruzzaman",
    "Full Stack Developer Dossier",
    "Software Engineer Experience",
    "Kodevio Limited Developer",
    "Software Architect Bangladesh",
    "Next.js Developer Profile",
    "NestJS Engineer Credentials",
    "Golang Backend Developer",
    "PERN Stack Developer",
    "MERN Stack Developer",
    "Rapid MVP Specialist",
    "Enterprise ERP Architect",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "profile",
    url: `${baseUrl}/about`,
    siteName: "Mahdi (Moniruzzaman Mahdi / mahdimonir) Portfolio",
    title: "About Moniruzzaman Mahdi (Mahdi Monir / mahdimonir) — Full Stack Developer & Software Architect",
    description:
      "Complete engineering dossier: production roles at Kodevio Limited, education at National University, system design cohorts, and technical specializations.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "About Mahdi (Moniruzzaman Mahdi / mahdimonir) — Full Stack Developer & Software Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Mahdimonir2004",
    creator: "@Mahdimonir2004",
    title: "About Moniruzzaman Mahdi (Mahdi Monir / mahdimonir)",
    description:
      "Complete engineering dossier: production roles at Kodevio Limited, education, system design cohorts, and technical specializations.",
    images: ["/opengraph-image"],
  },
};

export default async function AboutPage() {
  const data = await getNormalizedPortfolio();

  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${baseUrl}/about/#webpage`,
    url: `${baseUrl}/about`,
    name: "About Moniruzzaman Mahdi (Mahdi Monir / mahdimonir)",
    description:
      "Comprehensive biography, work track record, formal education, certifications, and technical capabilities of Moniruzzaman Mahdi.",
    mainEntity: {
      "@type": "Person",
      name: "Moniruzzaman Mahdi",
      alternateName: [
        "Mahdi",
        "Mahdi Monir",
        "mahdimonir",
        "Moniruzzaman",
        "MD Moniruzzaman",
        "MAHDI®",
      ],
      jobTitle: "Senior Full Stack Developer & Software Architect",
      url: baseUrl,
      worksFor: {
        "@type": "Organization",
        name: "Kodevio Limited",
      },
      alumniOf: {
        "@type": "EducationalOrganization",
        name: "National University",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <AboutView data={data} />
    </>
  );
}
