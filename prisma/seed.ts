import "dotenv/config";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables.");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const dbJsonPath = path.join(process.cwd(), "src/lib/portfolio-db.json");
const dbJson = JSON.parse(fs.readFileSync(dbJsonPath, "utf8"));

async function main() {
  console.log("🌱 Starting Prisma TypeScript seed...");

  const adminEmail = (
    process.env.ADMIN_EMAIL ||
    process.env.SMTP_USER ||
    "mahdimoniruzzaman@gmail.com"
  )
    .toLowerCase()
    .trim();

  const defaultPasswordHash = await bcrypt.hash("admin123", 10);

  // 1. Seed Unified User (Admin + Owner)
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      firstName: dbJson.firstName,
      fullName: dbJson.name,
      title: dbJson.title,
      role: dbJson.role,
      location: dbJson.location,
      phone: dbJson.phone || null,
      timezone: dbJson.timezone || null,
      availability: dbJson.availability,
      responseTime: dbJson.responseTime,
      heroHeadline: dbJson.hero.headline,
      heroHeadlineSecond: dbJson.hero.headlineSecond,
      heroSubheadline: dbJson.hero.subheadline,
      heroAvailability: dbJson.hero.availability,
      aboutLabel: dbJson.about.label,
      focus: dbJson.about.focus || [],
      githubUrl: dbJson.socials.github,
      linkedinUrl: dbJson.socials.linkedin,
      twitterUrl: dbJson.socials.twitter || null,
      quoteText: dbJson.quote?.text || null,
      quoteAuthor: dbJson.quote?.author || null,
    },
    create: {
      email: adminEmail,
      password: defaultPasswordHash,
      firstName: dbJson.firstName,
      fullName: dbJson.name,
      title: dbJson.title,
      role: dbJson.role,
      location: dbJson.location,
      phone: dbJson.phone || null,
      timezone: dbJson.timezone || null,
      availability: dbJson.availability,
      responseTime: dbJson.responseTime,
      heroHeadline: dbJson.hero.headline,
      heroHeadlineSecond: dbJson.hero.headlineSecond,
      heroSubheadline: dbJson.hero.subheadline,
      heroAvailability: dbJson.hero.availability,
      aboutLabel: dbJson.about.label,
      focus: dbJson.about.focus || [],
      githubUrl: dbJson.socials.github,
      linkedinUrl: dbJson.socials.linkedin,
      twitterUrl: dbJson.socials.twitter || null,
      quoteText: dbJson.quote?.text || null,
      quoteAuthor: dbJson.quote?.author || null,
    },
  });
  console.log(`✓ Seeded User: ${user.email} (id: ${user.id})`);

  // 2. Seed Experience
  if (Array.isArray(dbJson.about?.experience)) {
    await prisma.experience.deleteMany({ where: { userId: user.id } });
    await prisma.experience.createMany({
      data: dbJson.about.experience.map((exp: any, index: number) => ({
        userId: user.id,
        company: exp.company,
        role: exp.role,
        period: exp.period,
        location: exp.location || null,
        current: Boolean(exp.current),
        companyUrl: exp.companyUrl || null,
        companyLogo: exp.companyLogo || null,
        description: exp.description || null,
        achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
        order: index,
      })),
    });
    console.log(`✓ Seeded ${dbJson.about.experience.length} experiences`);
  }

  // 3. Seed Education
  if (Array.isArray(dbJson.about?.education)) {
    await prisma.education.deleteMany({ where: { userId: user.id } });
    await prisma.education.createMany({
      data: dbJson.about.education.map((edu: any, index: number) => ({
        userId: user.id,
        degree: edu.degree,
        institution: edu.institution,
        period: edu.period,
        current: Boolean(edu.current),
        order: index,
      })),
    });
    console.log(`✓ Seeded ${dbJson.about.education.length} education entries`);
  }

  // 4. Seed Courses
  if (Array.isArray(dbJson.about?.courses)) {
    await prisma.course.deleteMany({ where: { userId: user.id } });
    await prisma.course.createMany({
      data: dbJson.about.courses.map((c: any, index: number) => ({
        userId: user.id,
        title: c.title,
        institution: c.institution,
        period: c.period,
        certificateUrl: c.certificateUrl || null,
        completed: Boolean(c.completed),
        order: index,
      })),
    });
    console.log(`✓ Seeded ${dbJson.about.courses.length} courses`);
  }

  // 5. Seed Categories
  const categoryDefinitions = [
    { slug: "full-stack", label: "Full Stack", order: 0 },
    { slug: "platforms-cms", label: "Platforms & CMS", order: 1 },
    { slug: "enterprise-commerce", label: "Enterprise & Commerce", order: 2 },
  ];

  const categoryMap = new Map<string, number>();
  for (const cat of categoryDefinitions) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { label: cat.label, order: cat.order },
      create: { slug: cat.slug, label: cat.label, order: cat.order },
    });
    categoryMap.set(cat.label, record.id);
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`✓ Seeded ${categoryDefinitions.length} categories`);

  // 6. Seed Tech Stacks master registry
  const techMap = new Map<string, { name: string; role: string; iconUrl?: string | null }>();
  if (Array.isArray(dbJson.skills)) {
    for (const group of dbJson.skills) {
      for (const item of group.items) {
        if (!techMap.has(item.name)) {
          techMap.set(item.name, {
            name: item.name,
            role: group.category,
            iconUrl: item.url,
          });
        }
      }
    }
  }
  if (Array.isArray(dbJson.projects)) {
    for (const p of dbJson.projects) {
      if (Array.isArray(p.tech)) {
        for (const t of p.tech) {
          if (!techMap.has(t.name)) {
            techMap.set(t.name, {
              name: t.name,
              role: t.category,
              iconUrl: null,
            });
          }
        }
      }
    }
  }

  const techIdMap = new Map<string, number>();
  for (const tech of techMap.values()) {
    const record = await prisma.techStack.upsert({
      where: { name: tech.name },
      update: {
        role: tech.role,
        ...(tech.iconUrl ? { iconUrl: tech.iconUrl } : {}),
      },
      create: {
        name: tech.name,
        role: tech.role,
        iconUrl: tech.iconUrl || null,
      },
    });
    techIdMap.set(tech.name, record.id);
  }
  console.log(`✓ Seeded ${techIdMap.size} tech stacks in master registry`);

  // 7. Seed Projects with relational associations
  if (Array.isArray(dbJson.projects)) {
    for (let i = 0; i < dbJson.projects.length; i++) {
      const p = dbJson.projects[i];
      const categoryId = categoryMap.get(p.category) || categoryMap.get("Full Stack") || 1;

      const project = await prisma.project.upsert({
        where: { slug: p.slug },
        update: {
          displayId: p.id,
          title: p.title,
          tagline: p.tagline || null,
          stack: p.stack,
          description: p.description,
          longDescription: p.longDescription || null,
          coverImage: p.image,
          role: p.role || null,
          duration: p.duration || null,
          client: p.client || null,
          status: p.status || "Completed",
          cta: p.cta || "View Project",
          liveUrl: p.links?.live || null,
          codeUrl: p.links?.code || null,
          order: i,
          featured: i < 4,
          categoryId,
        },
        create: {
          displayId: p.id,
          slug: p.slug,
          title: p.title,
          tagline: p.tagline || null,
          stack: p.stack,
          description: p.description,
          longDescription: p.longDescription || null,
          coverImage: p.image,
          role: p.role || null,
          duration: p.duration || null,
          client: p.client || null,
          status: p.status || "Completed",
          cta: p.cta || "View Project",
          liveUrl: p.links?.live || null,
          codeUrl: p.links?.code || null,
          order: i,
          featured: i < 4,
          categoryId,
        },
      });

      // Gallery Images
      await prisma.projectImage.deleteMany({ where: { projectId: project.id } });
      if (Array.isArray(p.images) && p.images.length > 0) {
        await prisma.projectImage.createMany({
          data: p.images.map((url: string, imgIndex: number) => ({
            projectId: project.id,
            url,
            order: imgIndex,
          })),
        });
      }

      // Feature highlights
      await prisma.projectFeature.deleteMany({ where: { projectId: project.id } });
      if (Array.isArray(p.features) && p.features.length > 0) {
        await prisma.projectFeature.createMany({
          data: p.features.map((text: string, featIndex: number) => ({
            projectId: project.id,
            text,
            order: featIndex,
          })),
        });
      }

      // Tech Stack M2M relations
      await prisma.projectTechStack.deleteMany({ where: { projectId: project.id } });
      if (Array.isArray(p.tech)) {
        for (let tIndex = 0; tIndex < p.tech.length; tIndex++) {
          const techId = techIdMap.get(p.tech[tIndex].name);
          if (techId) {
            await prisma.projectTechStack.create({
              data: {
                projectId: project.id,
                techStackId: techId,
                order: tIndex,
              },
            });
          }
        }
      }
    }
    console.log(`✓ Seeded ${dbJson.projects.length} projects with full relations`);
  }

  // 8. Seed Skill Groups and items
  if (Array.isArray(dbJson.skills)) {
    for (let grpIndex = 0; grpIndex < dbJson.skills.length; grpIndex++) {
      const grp = dbJson.skills[grpIndex];
      const skillGroup = await prisma.skillGroup.upsert({
        where: { label: grp.category },
        update: { order: grpIndex },
        create: { label: grp.category, order: grpIndex },
      });

      await prisma.skillGroupItem.deleteMany({ where: { skillGroupId: skillGroup.id } });
      for (let itemIndex = 0; itemIndex < grp.items.length; itemIndex++) {
        const techId = techIdMap.get(grp.items[itemIndex].name);
        if (techId) {
          await prisma.skillGroupItem.create({
            data: {
              skillGroupId: skillGroup.id,
              techStackId: techId,
              order: itemIndex,
            },
          });
        }
      }
    }
    console.log(`✓ Seeded ${dbJson.skills.length} skill groups with relations`);
  }

  console.log("🎉 TypeScript Prisma seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
