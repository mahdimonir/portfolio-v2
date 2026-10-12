import { Metadata } from "next";
import { getNormalizedPortfolio } from "@/lib/portfolio-service";
import AboutView from "./AboutView";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahdimonir.dev";

export const metadata: Metadata = {
    title: "About & Engineering Dossier",
    description:
        "Engineering track record, career history at Kodevio Limited & Rank Nexis, academic background, certified cohorts, and technical architecture specializations of Moniruzzaman Mahdi (@mahdimonir / Mahdi).",
    keywords: [
        "mahdi",
        "mahdimonir",
        "Moniruzzaman Mahdi",
        "About Moniruzzaman Mahdi",
        "Mahdi Monir",
        "Moniruzzaman",
        "MD Moniruzzaman",
        "Full Stack Engineer Dossier",
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
        siteName: "Moniruzzaman Mahdi",
        title: "About & Engineering Dossier — Moniruzzaman Mahdi",
        description:
            "Engineering background, career track record at Kodevio Limited, education at National University, system design cohorts, and architectural specializations of Moniruzzaman Mahdi (@mahdimonir / Mahdi).",
        images: [
            {
                url: "/Moniruzzaman_Mahdi.png",
                width: 1200,
                height: 1500,
                alt: "Moniruzzaman Mahdi (mahdimonir / Mahdi) — Full Stack Developer & Software Architect Portrait",
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
                alt: "Moniruzzaman Mahdi — Engineering Dossier Banner",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@Mahdimonir2004",
        creator: "@Mahdimonir2004",
        title: "About & Engineering Dossier — Moniruzzaman Mahdi",
        description:
            "Engineering background, career history at Kodevio Limited, education, and technical specializations of Moniruzzaman Mahdi (@mahdimonir / Mahdi).",
        images: ["/Moniruzzaman_Mahdi.png", "/opengraph-image"],
    },
};

export default async function AboutPage() {
    const data = await getNormalizedPortfolio();

    const aboutPageSchema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${baseUrl}/about/#webpage`,
        url: `${baseUrl}/about`,
        name: "About & Engineering Dossier — Moniruzzaman Mahdi",
        description:
            "Comprehensive biography, work track record, formal education, certifications, and technical capabilities of Moniruzzaman Mahdi (@mahdimonir / Mahdi).",
        mainEntity: {
            "@type": "Person",
            name: "Moniruzzaman Mahdi",
            alternateName: ["mahdi", "mahdimonir", "Mahdi", "Mahdi Monir", "Moniruzzaman", "MD Moniruzzaman", "devmahdi", "MAHDI®"],
            jobTitle: "Senior Full Stack Developer & Software Architect",
            url: baseUrl,
            image: `${baseUrl}/Moniruzzaman_Mahdi.png`,
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
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }} />
            <AboutView data={data} />
        </>
    );
}
