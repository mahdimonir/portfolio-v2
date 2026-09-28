import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getNormalizedPortfolio } from "@/lib/portfolio-service";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super_secret_portfolio_jwt_key_2026_secure"
);

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// GET /api/portfolio — returns portfolio assembled from normalized models
export async function GET() {
  try {
    const data = await getNormalizedPortfolio();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/portfolio error:", error);
    return NextResponse.json({ error: "Failed to load portfolio" }, { status: 500 });
  }
}

// POST /api/portfolio — update portfolio data across normalized tables
export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // 1. Update User table
    const user = await prisma.user.findFirst();
    if (user && body.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: body.name,
          firstName: body.firstName || user.firstName,
          title: body.title || user.title,
          role: body.role || user.role,
          location: body.location || user.location,
          email: body.email || user.email,
          phone: body.phone ?? user.phone,
          timezone: body.timezone ?? user.timezone,
          availability: body.availability || user.availability,
          responseTime: body.responseTime || user.responseTime,
          heroHeadline: body.hero?.headline || user.heroHeadline,
          heroHeadlineSecond: body.hero?.headlineSecond || user.heroHeadlineSecond,
          heroSubheadline: body.hero?.subheadline || user.heroSubheadline,
          heroAvailability: body.hero?.availability || user.heroAvailability,
          aboutLabel: body.about?.label || user.aboutLabel,
          focus: Array.isArray(body.about?.focus) ? body.about.focus : user.focus,
          githubUrl: body.socials?.github || user.githubUrl,
          linkedinUrl: body.socials?.linkedin || user.linkedinUrl,
          twitterUrl: body.socials?.twitter ?? user.twitterUrl,
          quoteText: body.quote?.text ?? user.quoteText,
          quoteAuthor: body.quote?.author ?? user.quoteAuthor,
        },
      });

      // 2. Synchronize experiences if provided
      if (Array.isArray(body.about?.experience)) {
        await prisma.experience.deleteMany({ where: { userId: user.id } });
        await prisma.experience.createMany({
          data: body.about.experience.map((exp: any, index: number) => ({
            userId: user.id,
            company: exp.company || "Company",
            role: exp.role || "Role",
            period: exp.period || exp.years || "",
            location: exp.location || null,
            current: Boolean(exp.current),
            companyUrl: exp.companyUrl || null,
            companyLogo: exp.companyLogo || null,
            description: exp.description || null,
            achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
            order: index,
          })),
        });
      }

      // 3. Synchronize education if provided
      if (Array.isArray(body.about?.education)) {
        await prisma.education.deleteMany({ where: { userId: user.id } });
        await prisma.education.createMany({
          data: body.about.education.map((edu: any, index: number) => ({
            userId: user.id,
            degree: edu.degree || "",
            institution: edu.institution || edu.school || "",
            period: edu.period || edu.years || "",
            current: Boolean(edu.current),
            order: index,
          })),
        });
      }

      // 4. Synchronize courses if provided
      if (Array.isArray(body.about?.courses)) {
        await prisma.course.deleteMany({ where: { userId: user.id } });
        await prisma.course.createMany({
          data: body.about.courses.map((c: any, index: number) => ({
            userId: user.id,
            title: c.title || "",
            institution: c.institution || "",
            period: c.period || "",
            certificateUrl: c.certificateUrl || null,
            completed: Boolean(c.completed),
            order: index,
          })),
        });
      }
    }

    // 5. Synchronize Projects if provided
    if (Array.isArray(body.projects)) {
      const allCategories = await prisma.category.findMany();
      const defaultCategory = allCategories[0] || (await prisma.category.create({
        data: { slug: "full-stack", label: "Full Stack", order: 0 }
      }));

      // Gather or upsert master tech stacks referenced in projects
      const techNameMap = new Map<string, number>();
      const existingTechs = await prisma.techStack.findMany();
      for (const t of existingTechs) {
        techNameMap.set(t.name.toLowerCase(), t.id);
      }

      // Upsert projects and relations
      const validSlugs: string[] = [];

      for (let i = 0; i < body.projects.length; i++) {
        const p = body.projects[i];
        if (!p.title) continue;

        const slug = (p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
        validSlugs.push(slug);

        // Find category by label or slug
        const cat = allCategories.find(
          (c) => c.label.toLowerCase() === (p.category || "").toLowerCase() ||
                 c.slug.toLowerCase() === (p.category || "").toLowerCase()
        ) || defaultCategory;

        const images: string[] = Array.isArray(p.images) && p.images.length > 0 
          ? p.images 
          : p.image ? [p.image] : [];
        const coverImage = images.length > 0 ? images[0] : (p.coverImage || p.image || "");

        const projectRecord = await prisma.project.upsert({
          where: { slug },
          update: {
            displayId: p.id || String(i + 1).padStart(2, "0"),
            title: p.title,
            tagline: p.tagline || null,
            stack: p.stack || "",
            description: p.description || "",
            longDescription: p.longDescription || null,
            coverImage,
            role: p.role || null,
            duration: p.duration || null,
            client: p.client || null,
            status: p.status || "Completed",
            cta: p.cta || "View Project",
            liveUrl: p.links?.live || null,
            codeUrl: p.links?.code || null,
            order: i,
            featured: Boolean(p.featured !== undefined ? p.featured : i < 4),
            categoryId: cat.id,
          },
          create: {
            displayId: p.id || String(i + 1).padStart(2, "0"),
            slug,
            title: p.title,
            tagline: p.tagline || null,
            stack: p.stack || "",
            description: p.description || "",
            longDescription: p.longDescription || null,
            coverImage,
            role: p.role || null,
            duration: p.duration || null,
            client: p.client || null,
            status: p.status || "Completed",
            cta: p.cta || "View Project",
            liveUrl: p.links?.live || null,
            codeUrl: p.links?.code || null,
            order: i,
            featured: Boolean(p.featured !== undefined ? p.featured : i < 4),
            categoryId: cat.id,
          },
        });

        // Sync Gallery Images
        await prisma.projectImage.deleteMany({ where: { projectId: projectRecord.id } });
        if (images.length > 0) {
          await prisma.projectImage.createMany({
            data: images.map((url, imgIdx) => ({
              projectId: projectRecord.id,
              url,
              order: imgIdx,
            })),
          });
        }

        // Sync Feature highlights
        await prisma.projectFeature.deleteMany({ where: { projectId: projectRecord.id } });
        if (Array.isArray(p.features) && p.features.length > 0) {
          await prisma.projectFeature.createMany({
            data: p.features.map((feat: string, featIdx: number) => ({
              projectId: projectRecord.id,
              text: feat,
              order: featIdx,
            })),
          });
        }

        // Sync Tech Stacks
        await prisma.projectTechStack.deleteMany({ where: { projectId: projectRecord.id } });
        if (Array.isArray(p.tech)) {
          for (let tIdx = 0; tIdx < p.tech.length; tIdx++) {
            const techItem = p.tech[tIdx];
            const techName = typeof techItem === "string" ? techItem : techItem.name;
            if (!techName) continue;

            let techId = techNameMap.get(techName.toLowerCase());
            if (!techId) {
              const created = await prisma.techStack.create({
                data: {
                  name: techName,
                  role: (typeof techItem === "object" ? techItem.category : null) || "Full Stack",
                  iconUrl: typeof techItem === "object" ? techItem.iconUrl || null : null,
                },
              });
              techId = created.id;
              techNameMap.set(techName.toLowerCase(), techId);
            }

            await prisma.projectTechStack.create({
              data: {
                projectId: projectRecord.id,
                techStackId: techId,
                order: tIdx,
              },
            });
          }
        }
      }

      // Delete removed projects
      if (validSlugs.length > 0) {
        await prisma.project.deleteMany({
          where: { slug: { notIn: validSlugs } },
        });
      }
    }

    // 6. Synchronize Skills and Skill Groups if provided
    if (Array.isArray(body.skills)) {
      const activeGroupLabels: string[] = [];

      for (let sIdx = 0; sIdx < body.skills.length; sIdx++) {
        const grp = body.skills[sIdx];
        if (!grp.category) continue;

        activeGroupLabels.push(grp.category);

        const groupRecord = await prisma.skillGroup.upsert({
          where: { label: grp.category },
          update: { order: sIdx },
          create: { label: grp.category, order: sIdx },
        });

        await prisma.skillGroupItem.deleteMany({ where: { skillGroupId: groupRecord.id } });

        if (Array.isArray(grp.items)) {
          for (let itemIdx = 0; itemIdx < grp.items.length; itemIdx++) {
            const item = grp.items[itemIdx];
            if (!item.name) continue;

            const existingTech = await prisma.techStack.findUnique({
              where: { name: item.name },
            });

            const techId = existingTech
              ? existingTech.id
              : (
                  await prisma.techStack.create({
                    data: {
                      name: item.name,
                      role: grp.category,
                      iconUrl: item.url || null,
                    },
                  })
                ).id;

            await prisma.skillGroupItem.create({
              data: {
                skillGroupId: groupRecord.id,
                techStackId: techId,
                order: itemIdx,
              },
            });
          }
        }
      }

      if (activeGroupLabels.length > 0) {
        await prisma.skillGroup.deleteMany({
          where: { label: { notIn: activeGroupLabels } },
        });
      }
    }

    // 7. Synchronize to local JSON file for local build / server-side imports
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "src", "lib", "portfolio-db.json");
      await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf-8");
    } catch (fsErr) {
      console.warn("Local JSON file sync skipped:", fsErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST portfolio error:", error);
    return NextResponse.json(
      { error: "Failed to save portfolio data" },
      { status: 500 }
    );
  }
}
