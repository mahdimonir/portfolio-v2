import React from "react";

export default function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahdimonir.dev";

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${baseUrl}/#person`,
    name: "Moniruzzaman Mahdi",
    givenName: "Moniruzzaman",
    familyName: "Mahdi",
    additionalName: "Monir",
    alternateName: [
      "Mahdi",
      "Mahdi Monir",
      "mahdimonir",
      "Moniruzzaman",
      "Moniruzzaman Mahdi",
      "MD Moniruzzaman",
      "Mahdi Moniruzzaman",
      "MAHDI®",
      "mahdimonir.dev",
    ],
    identifier: "mahdimonir",
    jobTitle: [
      "Senior Full Stack Developer",
      "Software Engineer",
      "Software Architect",
      "System Architect",
      "Backend Systems Engineer",
      "Frontend Application Developer",
      "Next.js Specialist",
      "NestJS & Node.js Architect",
      "Go / Golang Developer",
      "SaaS Platform Engineer",
      "MVP Rapid Prototyping Specialist",
      "Enterprise ERP Architect",
      "Custom CMS Specialist",
    ],
    description:
      "Mahdi (Moniruzzaman Mahdi / @mahdimonir) is a Senior Full Stack Developer & Software Architect specializing in Next.js, React, Node.js, NestJS, Go (Golang), and PostgreSQL. Expert in rapid MVP prototyping (0-to-1 in 2-4 weeks), multi-tenant SaaS engineering, enterprise ERP systems, custom CMS platforms, and high-performance cloud API microservices.",
    url: baseUrl,
    image: `${baseUrl}/opengraph-image`,
    email: "mailto:mahdimoniruzzaman@gmail.com",
    telephone: "+8801876689921",
    sameAs: [
      "https://github.com/mahdimonir",
      "https://www.linkedin.com/in/moniruzzaman-mahdi/",
      "https://x.com/Mahdimonir2004",
      "https://twitter.com/Mahdimonir2004",
      "https://3d.mahdimonir.dev",
      "https://mahdimonir.dev",
    ],
    knowsAbout: [
      "Full Stack Web Development",
      "Software Architecture & System Design",
      "MVP Development & Rapid Prototyping (Zero-to-One)",
      "SaaS Architecture & Multi-Tenancy",
      "Enterprise Resource Planning (ERP)",
      "Custom & Headless Content Management Systems (CMS)",
      "Next.js & Next.js 16 (App Router, Server Actions, Streaming)",
      "React & React 19 (Concurrent Rendering, Server Components)",
      "TypeScript & JavaScript (ESNext)",
      "Node.js & Express.js Backend Architecture",
      "NestJS Modular Framework (Guards, Interceptors, Microservices)",
      "Go / Golang (High-Throughput Services, Concurrency, Goroutines)",
      "PERN Stack (PostgreSQL, Express/NestJS, React/Next.js, Node.js)",
      "MERN Stack (MongoDB, Express, React/Next.js, Node.js)",
      "PostgreSQL, Neon Serverless Postgres, and Prisma ORM",
      "MongoDB & Mongoose ODM",
      "Redis Caching, Pub/Sub & Rate Limiting",
      "Docker Containerization & Docker Compose",
      "RESTful API Architecture & OpenAPI / Swagger Specs",
      "WebSocket & Socket.IO Real-Time Gateways",
      "Stripe Checkout & Billing Webhooks Integration",
      "SSLCommerz & Mobile Money Integrations",
      "AI / LLM Integration (OpenAI API, Streaming Responses, Socratic Agents)",
      "Tailwind CSS & Framer Motion Advanced Animation",
    ],
    hasOccupation: [
      {
        "@type": "Occupation",
        name: "Senior Full Stack Software Engineer",
        skills: [
          "Next.js",
          "React",
          "TypeScript",
          "Node.js",
          "NestJS",
          "Go",
          "PostgreSQL",
          "Prisma",
          "Docker",
        ],
        occupationLocation: {
          "@type": "Country",
          name: "Worldwide (Remote)",
        },
      },
      {
        "@type": "Occupation",
        name: "Software & System Architect",
        skills: [
          "System Design",
          "Microservices",
          "Database Architecture",
          "API Design",
          "SaaS Multi-Tenancy",
        ],
        occupationLocation: {
          "@type": "Country",
          name: "Worldwide (Remote)",
        },
      },
      {
        "@type": "Occupation",
        name: "SaaS Product Engineer & MVP Specialist",
        skills: [
          "MVP Rapid Prototyping",
          "Stripe Billing",
          "Authentication & RBAC",
          "Cloud Deployment",
        ],
        occupationLocation: {
          "@type": "Country",
          name: "Worldwide (Remote)",
        },
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Engineering & Architecture Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Full-Stack Web Application Development",
            serviceType: "Web Development",
            description:
              "End-to-end full-stack web application engineering using Next.js 16, React 19, Node.js/NestJS, and PostgreSQL with responsive, animated interfaces.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "MVP Rapid Prototyping & Zero-to-One Launch",
            serviceType: "MVP Development",
            description:
              "Rapid delivery of production-grade Minimum Viable Products for startups, founders, and enterprises within 2 to 4 weeks.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "SaaS Platform Architecture & Subscription Engineering",
            serviceType: "SaaS Development",
            description:
              "Multi-tenant SaaS engineering featuring Stripe subscription billing, quota metering, usage analytics, role-based access control, and webhooks.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom Enterprise ERP & Business Operations Systems",
            serviceType: "ERP Development",
            description:
              "Tailored ERP systems with real-time stock synchronization, multi-store inventory, automated invoicing, POS integrations, and vendor CRM.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom & Headless CMS Platform Engineering",
            serviceType: "CMS Development",
            description:
              "Atomic content management platforms with dynamic section composition, rich-text tip-tap editing, role-based workflows, and SEO clusters.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "High-Performance Backend & Microservice Architecture",
            serviceType: "Backend Engineering",
            description:
              "Modular microservices and RESTful/WebSocket APIs built with NestJS, Go (Golang), and Node.js for high concurrency and low latency.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Interactive Frontend Engineering & UI/UX Technologist",
            serviceType: "Frontend Engineering",
            description:
              "State-of-the-art interactive user interfaces utilizing Tailwind CSS, Framer Motion, 3D Canvas, and accessible Swiss design aesthetics.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Database Design, Indexing & Query Optimization",
            serviceType: "Database Architecture",
            description:
              "Relational schema modeling with PostgreSQL, Neon, Prisma ORM, MongoDB, and sub-millisecond Redis caching layers.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI Integration & Intelligent Agent Pipelines",
            serviceType: "AI Engineering",
            description:
              "Integration of OpenAI and Anthropic LLM models, streaming chat, Socratic tutor agents, prompt pipelines, and token usage optimization.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Cloud Deployment, Containerization & DevOps",
            serviceType: "DevOps & Infrastructure",
            description:
              "Docker containerization, CI/CD pipeline automation with GitHub Actions, Vercel deployments, AWS S3 asset delivery, and SSL configuration.",
          },
        },
      ],
    },
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

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${baseUrl}/#service`,
    name: "Mahdi (Moniruzzaman Mahdi / mahdimonir) — Software Engineering & Architecture",
    alternateName: [
      "Mahdi Monir Development Services",
      "mahdimonir Studio",
      "Moniruzzaman Mahdi Software Consulting",
    ],
    url: baseUrl,
    image: `${baseUrl}/opengraph-image`,
    email: "mahdimoniruzzaman@gmail.com",
    telephone: "+8801876689921",
    provider: {
      "@id": `${baseUrl}/#person`,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Worldwide (Remote)",
    },
    serviceType: [
      "Full-Stack Web Development",
      "SaaS MVP Rapid Prototyping",
      "Custom Enterprise ERP Systems",
      "Headless CMS Platforms",
      "Backend API & Microservices",
      "AI Application Integration",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Engineering & Architecture Services",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Mahdi (Moniruzzaman Mahdi / mahdimonir) — Full Stack Developer & Software Architect",
    alternateName: [
      "mahdimonir",
      "Mahdi Monir Portfolio",
      "Moniruzzaman Mahdi Dev",
      "mahdimonir.dev",
      "MAHDI®",
    ],
    description:
      "Official portfolio, case studies, and engineering dossier of Mahdi (Moniruzzaman Mahdi / @mahdimonir) — Full Stack Developer & Software Architect specializing in Next.js, NestJS, Go, PostgreSQL, SaaS MVPs, ERP, and CMS platforms.",
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
    name: "Mahdi (Moniruzzaman Mahdi / mahdimonir) — Engineering Profile & Dossier",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
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

