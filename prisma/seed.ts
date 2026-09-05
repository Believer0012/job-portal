import bcrypt from "bcrypt";
import { PrismaClient, EmploymentType, JobStatus, Role } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  "Engineering",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "DevOps",
  "QA / Testing",
  "Data Science",
  "Product Management",
  "UI/UX Design",
];

const experienceLevels = ["Entry Level", "Junior", "Mid Level", "Senior", "Lead"];

const jobs = [
  {
    slug: "senior-full-stack-engineer",
    title: "Senior Full Stack Engineer",
    description: "Build reliable product experiences across a TypeScript and PostgreSQL stack.",
    companyName: "Northstar Labs",
    location: "Bengaluru, India",
    salaryMin: 1800000,
    salaryMax: 2600000,
    employmentType: EmploymentType.FULL_TIME,
    status: JobStatus.PUBLISHED,
    category: "Full Stack Development",
    experienceLevel: "Senior",
  },
  {
    slug: "junior-frontend-developer",
    title: "Junior Frontend Developer",
    description: "Turn thoughtful product designs into accessible, polished React interfaces.",
    companyName: "Brightside Digital",
    location: "Remote",
    salaryMin: 700000,
    salaryMax: 1000000,
    employmentType: EmploymentType.FULL_TIME,
    status: JobStatus.PUBLISHED,
    category: "Frontend Development",
    experienceLevel: "Junior",
  },
  {
    slug: "platform-devops-contractor",
    title: "Platform DevOps Contractor",
    description: "Improve delivery pipelines, observability, and infrastructure reliability.",
    companyName: "Orbit Commerce",
    location: "Hyderabad, India",
    salaryMin: 1200000,
    salaryMax: 1800000,
    employmentType: EmploymentType.CONTRACT,
    status: JobStatus.DRAFT,
    category: "DevOps",
    experienceLevel: "Mid Level",
  },
  {
    slug: "qa-automation-intern",
    title: "QA Automation Intern",
    description: "Learn modern testing practices while improving confidence in customer workflows.",
    companyName: "Civic Stack",
    location: "Pune, India",
    salaryMin: 240000,
    salaryMax: 360000,
    employmentType: EmploymentType.INTERNSHIP,
    status: JobStatus.PUBLISHED,
    category: "QA / Testing",
    experienceLevel: "Entry Level",
  },
  {
    slug: "product-manager-marketplace",
    title: "Product Manager, Marketplace",
    description: "Own discovery and delivery for tools that help teams find better talent.",
    companyName: "TalentSpring",
    location: "Mumbai, India",
    salaryMin: 1400000,
    salaryMax: 2200000,
    employmentType: EmploymentType.FULL_TIME,
    status: JobStatus.CLOSED,
    category: "Product Management",
    experienceLevel: "Lead",
  },
  {
    slug: "ux-research-and-design-freelancer",
    title: "UX Research and Design Freelancer",
    description: "Shape a clear, humane hiring journey through research and rapid prototyping.",
    companyName: "Mosaic Works",
    location: "Remote",
    salaryMin: 800000,
    salaryMax: 1200000,
    employmentType: EmploymentType.FREELANCE,
    status: JobStatus.DRAFT,
    category: "UI/UX Design",
    experienceLevel: "Mid Level",
  },
];

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set before seeding.");
  }

  const [categoryRecords, experienceRecords] = await Promise.all([
    Promise.all(
      categories.map((name) =>
        prisma.category.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    ),
    Promise.all(
      experienceLevels.map((name) =>
        prisma.experienceLevel.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    ),
  ]);

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "Development Administrator", role: Role.ADMIN },
    create: {
      email: adminEmail,
      name: "Development Administrator",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const seedUserEmail = process.env.SEED_USER_EMAIL;
  const seedUserPassword = process.env.SEED_USER_PASSWORD;

  if (seedUserEmail && seedUserPassword) {
    const userPasswordHash = await bcrypt.hash(seedUserPassword, 12);
    await prisma.user.upsert({
      where: { email: seedUserEmail },
      update: { name: "Development User", role: Role.USER },
      create: {
        email: seedUserEmail,
        name: "Development User",
        passwordHash: userPasswordHash,
        role: Role.USER,
      },
    });
  }

  const categoryByName = new Map(categoryRecords.map((category) => [category.name, category.id]));
  const experienceByName = new Map(
    experienceRecords.map((experience) => [experience.name, experience.id]),
  );

  for (const job of jobs) {
    const categoryId = categoryByName.get(job.category);
    const experienceLevelId = experienceByName.get(job.experienceLevel);

    if (!categoryId || !experienceLevelId) {
      throw new Error(`Missing master data for seeded job ${job.slug}.`);
    }

    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {
        title: job.title,
        description: job.description,
        requirements: "Relevant experience, clear communication, and a collaborative approach.",
        benefits: "Competitive compensation, flexible working, and professional development support.",
        companyName: job.companyName,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        employmentType: job.employmentType,
        status: job.status,
        categoryId,
        experienceLevelId,
        authorId: admin.id,
        publishedAt: job.status === JobStatus.PUBLISHED ? new Date() : null,
        closedAt: job.status === JobStatus.CLOSED ? new Date() : null,
      },
      create: {
        slug: job.slug,
        title: job.title,
        description: job.description,
        requirements: "Relevant experience, clear communication, and a collaborative approach.",
        benefits: "Competitive compensation, flexible working, and professional development support.",
        companyName: job.companyName,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        employmentType: job.employmentType,
        status: job.status,
        categoryId,
        experienceLevelId,
        authorId: admin.id,
        publishedAt: job.status === JobStatus.PUBLISHED ? new Date() : null,
        closedAt: job.status === JobStatus.CLOSED ? new Date() : null,
      },
    });
  }

  console.log(
    `Seed complete: ${categories.length} categories, ${experienceLevels.length} experience levels, ${jobs.length} jobs` +
      `${seedUserEmail && seedUserPassword ? ", 1 development user" : ""}.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });