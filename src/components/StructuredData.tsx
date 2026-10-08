import React from "react";

export default function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahdimonir.dev";

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${baseUrl}/#person`,
    name: "Moniruzzaman Mahdi",
    alternateName: ["Mahdi Monir", "MAHDI®"],
    jobTitle: "Full Stack Developer",
    description:
      "Full Stack Developer specializing in scalable React and Next.js applications, modular backend systems with Node.js and NestJS, and relational databases.",
    url: baseUrl,
    image: `${baseUrl}/opengraph-image`,
    email: "mailto:mahdimoniruzzaman@gmail.com",
    telephone: "+8801876689921",
    sameAs: [
      "https://github.com/mahdimonir",
      "https://www.linkedin.com/in/moniruzzaman-mahdi/",
      "https://x.com/Mahdimonir2004",
      "https://3d.mahdimonir.dev",
    ],
    knowsAbout: [
      "Full Stack Web Development",
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "NestJS",
      "Express.js",
      "PostgreSQL",
      "Prisma ORM",
      "MongoDB",
      "Docker",
      "Tailwind CSS",
      "RESTful API Design",
      "Database Architecture",
      "Web Performance Optimization",
    ],
    worksFor: {
      "@type": "Organization",
      name: "Kodevio Limited",
      url: "https://www.kodevio.com",
    },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "National University",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chattogram",
      addressRegion: "Chittagong",
      addressCountry: "BD",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Moniruzzaman Mahdi — Portfolio & Architecture",
    description:
      "Complete portfolio, full-stack case studies, and engineering highlights of Moniruzzaman Mahdi.",
    publisher: {
      "@id": `${baseUrl}/#person`,
    },
    inLanguage: "en-US",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
