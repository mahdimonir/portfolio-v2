import React from "react";

export default function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahdimonir.dev";

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${baseUrl}/#person`,
    name: "Moniruzzaman Mahdi",
    alternateName: ["Mahdi Monir", "MAHDI®", "Moniruzzaman Mahdi Developer"],
    jobTitle: "Senior Full Stack Developer & Software Architect",
    description:
      "Full Stack Developer & Software Architect specializing in Next.js, React, Node.js, NestJS, Go (Golang), and PostgreSQL. Expert in MVP rapid prototyping, scalable SaaS platforms, enterprise ERP systems, custom CMS, and high-performance PERN and MERN stack engineering.",
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
      "Software Architecture",
      "Software Engineering",
      "MVP Development & Rapid Prototyping",
      "SaaS Architecture & Engineering",
      "Enterprise Resource Planning (ERP)",
      "Content Management Systems (CMS & Headless CMS)",
      "Product Engineering",
      "Next.js & Next.js 16 (App Router, Server Actions)",
      "React & React 19",
      "Node.js Backend Architecture",
      "NestJS Modular Framework",
      "Go / Golang Concurrency & Microservices",
      "PERN Stack (PostgreSQL, Express/NestJS, React/Next.js, Node.js)",
      "MERN Stack (MongoDB, Express, React, Node.js)",
      "PostgreSQL & Prisma ORM",
      "Redis Caching & Real-Time Pub/Sub",
      "Docker & Containerization",
      "RESTful API Design & Swagger/OpenAPI",
      "WebSocket & Socket.IO Real-Time Gateways",
      "System Design & Scalability",
      "Web Performance Optimization",
      "Stripe Payment Gateway Integration",
    ],
    hasOccupation: {
      "@type": "Occupation",
      name: "Full Stack Software Engineer & System Architect",
      skills: [
        "Full-Stack Web Development",
        "MVP Prototyping",
        "SaaS Platform Development",
        "ERP Architecture",
        "Custom CMS Engineering",
        "Next.js",
        "NestJS",
        "Golang",
        "Node.js",
        "PostgreSQL",
        "PERN Stack",
        "MERN Stack",
      ],
      occupationLocation: {
        "@type": "Country",
        name: "Worldwide (Remote)",
      },
    },
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "MVP Rapid Prototyping & Zero-to-One Development",
          description: "Rapid delivery of high-quality, production-ready Minimum Viable Products for startups and enterprise teams within 2 to 4 weeks.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Full-Stack SaaS Platform Architecture",
          description: "End-to-end SaaS engineering with multi-tenant databases, Stripe subscription billing, quota management, and modern React/Next.js interfaces.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Enterprise ERP & Inventory System Development",
          description: "Custom ERP solutions featuring real-time stock sync, POS integrations, automated invoicing, CRM, and role-based staff administration.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Custom & Headless CMS Platform Engineering",
          description: "Custom content management platforms with dynamic section composition, rich-text tip-tap editing, role-based workflows, and SEO clusters.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "High-Performance Backend & API Architecture (NestJS, Go, Node.js)",
          description: "Modular microservices and RESTful/WebSocket APIs designed for high concurrency, low latency, and comprehensive OpenAPI specifications.",
        },
      },
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
    name: "Moniruzzaman Mahdi — Full Stack Developer & Software Architect",
    description:
      "Official portfolio, case studies, and engineering dossier of Moniruzzaman Mahdi — Full Stack Developer specializing in Next.js, NestJS, Go, PERN/MERN stacks, SaaS MVPs, ERP, and CMS platforms.",
    publisher: {
      "@id": `${baseUrl}/#person`,
    },
    inLanguage: "en-US",
  };

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${baseUrl}/#profile`,
    url: baseUrl,
    name: "Moniruzzaman Mahdi Engineering Profile",
    mainEntity: {
      "@id": `${baseUrl}/#person`,
    },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />
    </>
  );
}
