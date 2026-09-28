import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

// Run this once to set up the database tables
export async function GET() {
  try {
    // Create portfolio table
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create admins table
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `;

    // Create contact_messages table to store received inquiries
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Insert default portfolio data if empty
    const existing = await sql`SELECT id FROM portfolio LIMIT 1`;
    if (existing.length === 0) {
      const defaultData = {
        name: "Moniruzzaman Mahdi",
        firstName: "MAHDI",
        title: "Full Stack Developer",
        role: "Full Stack Developer",
        location: "Chattogram, Bangladesh",
        email: "mahdimoniruzzaman@gmail.com",
        phone: "+8801876689921",
        timezone: "UTC+6",
        availability: "Available for freelance & contract work",
        responseTime: "Usually replies within 24 hours",
        socials: {
          github: "https://github.com/mahdimonir",
          linkedin: "https://www.linkedin.com/in/moniruzzaman-mahdi/",
          twitter: "https://x.com/Mahdimonir2004",
        },
        hero: {
          headline: "Driven",
          headlineSecond: "by logic",
          subheadline: "Building robust software, automating the complex and focused on transforming static systems into intelligent ones.",
          availability: "Available for work",
        },
        about: {
          label: "Background & Data",
          education: {
            school: "National University",
            degree: "Bachelor of Science",
            years: "2024 – Present",
          },
          experience: [
            {
              company: "Freelance & Contract",
              role: "Full Stack Developer",
              years: "2023 – Present",
            },
          ],
          focus: [
            "MVP Development & Rapid Prototyping",
            "AI-Powered Feature Integration",
            "Scalable Full-Stack Architecture",
          ],
        },
        projects: [
          {
            id: "001",
            title: "E-Commerce Platform",
            stack: "React / Node.js / MongoDB / Stripe",
            description: "Full-stack e-commerce with Stripe payments, real-time inventory, admin dashboard, and order management.",
            links: { live: "https://ecommerce-demo.vercel.app", code: "https://github.com/mahdimonir/ecommerce" },
            image: "/p1.png",
            cta: "Live Project",
          },
          {
            id: "002",
            title: "Task Management App",
            stack: "Next.js / TypeScript / MongoDB / Tailwind",
            description: "Collaborative task manager with real-time sync, drag-and-drop Kanban boards, team workspaces.",
            links: { live: "https://taskapp-demo.vercel.app", code: "https://github.com/mahdimonir/taskapp" },
            image: "/p2.png",
            cta: "Live Project",
          },
          {
            id: "003",
            title: "AI Chat Application",
            stack: "React / Node.js / Socket.io / MongoDB",
            description: "Real-time chat platform with AI-powered smart replies, message suggestions, and automated moderation.",
            links: { live: "https://social-demo.vercel.app", code: "https://github.com/mahdimonir/social" },
            image: "/p3.png",
            cta: "Live Project",
          },
          {
            id: "004",
            title: "Weather Dashboard",
            stack: "React / TypeScript / REST API / Tailwind",
            description: "Location-based weather forecasts with interactive maps, 7-day predictions, and detailed analytics.",
            links: { live: "https://weather-demo.vercel.app", code: "https://github.com/mahdimonir/weather" },
            image: "/p4.png",
            cta: "Live Project",
          },
        ],
        skills: [
          {
            category: "Languages",
            items: [
              { name: "JavaScript", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
              { name: "TypeScript", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
              { name: "HTML5", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
              { name: "CSS3", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
              { name: "Python", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
            ],
          },
          {
            category: "Frontend",
            items: [
              { name: "React", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
              { name: "Next.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
              { name: "Tailwind CSS", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
            ],
          },
          {
            category: "Backend",
            items: [
              { name: "Node.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
              { name: "Express", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
              { name: "MongoDB", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
              { name: "PostgreSQL", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
            ],
          },
          {
            category: "Developer Tools",
            items: [
              { name: "Git", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
              { name: "GitHub", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
              { name: "VS Code", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
              { name: "Docker", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
              { name: "Postman", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" },
            ],
          },
        ],
        quote: {
          text: "The function of good software is to make the complex appear to be simple.",
          author: "Grady Booch",
        },
      };

      await sql`INSERT INTO portfolio (data) VALUES (${JSON.stringify(defaultData)})`;
    }

    // Insert default admin if none exists
    const adminExists = await sql`SELECT id FROM admins LIMIT 1`;
    if (adminExists.length === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await sql`INSERT INTO admins (username, password) VALUES ('admin', ${hash})`;
    }

    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (error) {
    console.error("Init error:", error);
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 });
  }
}
