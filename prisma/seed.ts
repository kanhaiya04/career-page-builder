import {
  JobStatus,
  JobType,
  PrismaClient,
  RecruiterRole,
  SectionType,
  WorkSetting,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedCompany = {
  name: string;
  slug: string;
  headline: string;
  subheadline: string;
  story: string;
  mission: string;
  headquarters: string;
  website: string;
  sizeRange: string;
  industries: string[];
  values: Array<{ title: string; description: string }>;
  perks: Array<{ label: string; description: string }>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    heroBackground: string;
    bannerImageUrl: string;
    logoUrl: string;
    cultureVideoUrl: string;
    eyebrow: string;
  };
  sections: Array<{
    title: string;
    kind: SectionType;
    summary: string;
    content: string;
    sortOrder: number;
  }>;
  jobs: Array<{
    title: string;
    slug: string;
    location: string;
    jobType: JobType;
    workSetting: WorkSetting;
    team: string;
    level: string;
    minSalary?: number;
    maxSalary?: number;
    description: string;
    applyUrl: string;
    status: JobStatus;
    tags: string[];
    featured?: boolean;
  }>;
  recruiter: {
    name: string;
    email: string;
    role: RecruiterRole;
    passcode: string;
  };
};

const seedCompanies: SeedCompany[] = [
  {
    name: "Acme Rockets",
    slug: "acme",
    headline: "Launch bold ideas with a team obsessed with craft.",
    subheadline:
      "We design sustainable launch systems that help climate-first companies ship hardware faster.",
    story:
      "Acme Rockets is a climate-focused aerospace studio trusted by Series B hardware teams. We design, test, and maintain launch systems that shrink emissions and keep supply chains local.",
    mission:
      "Accelerate deep tech breakthroughs while protecting the planet we share.",
    headquarters: "Austin, TX · Hybrid",
    website: "https://acmerockets.example.com",
    sizeRange: "150-250",
    industries: ["Climate Tech", "Aerospace"],
    values: [
      {
        title: "Default to clarity",
        description:
          "We bias toward transparent updates, concise PRDs, and decisions people can revisit later.",
      },
      {
        title: "Ship the whole experience",
        description:
          "Every launch includes instrumentation, docs, and enablement—not just code or hardware.",
      },
      {
        title: "Prototype with customers",
        description:
          "We run paired design + engineering reviews with partner teams every sprint.",
      },
    ],
    perks: [
      {
        label: "R&D Fridays",
        description: "No standing meetings after 1pm Friday to explore new tech.",
      },
      {
        label: "Hardware lab stipend",
        description: "Yearly $2,000 for tools, certifications, or courses.",
      },
      {
        label: "Family first benefits",
        description: "20 weeks paid leave + backup care for school closures.",
      },
    ],
    theme: {
      primaryColor: "#0f172a",
      secondaryColor: "#10b981",
      accentColor: "#fcd34d",
      backgroundColor: "#ecfdf5",
      heroBackground: "linear-gradient(135deg, #0f172a, #0d9488)",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      logoUrl: "https://dummyimage.com/160x40/0f172a/ffffff&text=Acme",
      cultureVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      eyebrow: "Trusted by climate-first builders",
    },
    sections: [
      {
        title: "About Acme",
        kind: SectionType.ABOUT,
        summary: "Full-stack launch studio",
        content:
          "Our pods pair mission control engineers with industrial designers and reliability analysts. Together we deliver new launch sites, telemetry dashboards, and service programs every quarter.",
        sortOrder: 1,
      },
      {
        title: "Life at Acme",
        kind: SectionType.LIFE_AT_COMPANY,
        summary: "People-first rituals",
        content:
          "We do Wednesday design studios, Friday launch show-and-tells, and quarterly field trips to watch customer launches. Benefits include hybrid flexibility, hardware stipends, and generous sabbaticals.",
        sortOrder: 2,
      },
      {
        title: "Values",
        kind: SectionType.VALUES,
        summary: "Principles we hire for",
        content:
          "Seek clarity, move with urgency, sweat details, and continuously close the loop with customers.",
        sortOrder: 3,
      },
    ],
    jobs: [
      {
        title: "Staff Propulsion Engineer",
        slug: "staff-propulsion-engineer",
        location: "Austin, TX",
        jobType: JobType.FULL_TIME,
        workSetting: WorkSetting.ONSITE,
        team: "Hardware Engineering",
        level: "Staff",
        minSalary: 185000,
        maxSalary: 215000,
        description:
          "Own the design and validation of reusable propulsion modules. Collaborate with design and supply chain partners to ship upgrades every quarter.",
        applyUrl: "https://acmerockets.example.com/jobs/propulsion",
        status: JobStatus.PUBLISHED,
        tags: ["Propulsion", "Thermal", "Python"],
        featured: true,
      },
      {
        title: "Product Design Lead",
        slug: "product-design-lead",
        location: "Remote (US)",
        jobType: JobType.FULL_TIME,
        workSetting: WorkSetting.HYBRID,
        team: "Product",
        level: "Senior",
        minSalary: 165000,
        maxSalary: 190000,
        description:
          "Shape the stories hardware teams share with regulators, investors, and partners. You'll own the modular component system powering customer-hosted launch dashboards.",
        applyUrl: "https://acmerockets.example.com/jobs/product-design",
        status: JobStatus.PUBLISHED,
        tags: ["Design Systems", "Storytelling", "Figma"],
      },
    ],
    recruiter: {
      name: "Jordan Ellis",
      email: "recruiting@acme.demo",
      role: RecruiterRole.OWNER,
      passcode: "launch-2025",
    },
  },
  {
    name: "Northwind Labs",
    slug: "northwind",
    headline: "Turn enterprise data into trusted copilots.",
    subheadline:
      "Northwind Labs builds applied AI products for operations teams at global retailers.",
    story:
      "We connect inventory, workforce, and logistics data to provide AI copilots that recommend actions inside the tools teams already use.",
    mission: "Give every operator leverage through responsible AI.",
    headquarters: "Remote · US & Europe",
    website: "https://northwindlabs.example.com",
    sizeRange: "80-120",
    industries: ["AI", "Retail Tech"],
    values: [
      {
        title: "Customers > features",
        description:
          "We instrument every workflow choice to learn how ops teams really work.",
      },
      {
        title: "Quality is speed",
        description:
          "Stable infra means we deploy copilots twice per week with confidence.",
      },
    ],
    perks: [
      {
        label: "Remote-first budget",
        description: "$1,500 annual stipend for home office or co-working.",
      },
      {
        label: "Learning credits",
        description: "$2,000/year for courses, coaching, or conferences.",
      },
    ],
    theme: {
      primaryColor: "#0f172a",
      secondaryColor: "#6366f1",
      accentColor: "#f97316",
      backgroundColor: "#eef2ff",
      heroBackground: "linear-gradient(135deg, #312e81, #4f46e5)",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
      logoUrl: "https://dummyimage.com/160x40/312e81/ffffff&text=Northwind",
      cultureVideoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      eyebrow: "AI copilots for retailers",
    },
    sections: [
      {
        title: "About Northwind",
        kind: SectionType.ABOUT,
        summary: "AI for operators",
        content:
          "Our copilots summarize anomalies from SAP, Manhattan, and Workday in under 60 seconds, guiding frontline teams to better calls with less tab-switching.",
        sortOrder: 1,
      },
      {
        title: "How we work",
        kind: SectionType.CUSTOM,
        summary: "Transparent rituals",
        content:
          "We run dual-track sprints, weekly customer office hours, and async demos recorded with Loom to keep every timezone in sync.",
        sortOrder: 2,
      },
    ],
    jobs: [
      {
        title: "Senior Applied Scientist",
        slug: "senior-applied-scientist",
        location: "Remote, Americas",
        jobType: JobType.FULL_TIME,
        workSetting: WorkSetting.REMOTE,
        team: "Machine Learning",
        level: "Senior",
        minSalary: 175000,
        maxSalary: 205000,
        description:
          "Prototype retrieval pipelines, evaluate guardrails, and ship copilots that understand supply chain nuances.",
        applyUrl: "https://northwindlabs.example.com/jobs/applied-scientist",
        status: JobStatus.PUBLISHED,
        tags: ["LLMs", "Retrieval", "Python"],
        featured: true,
      },
      {
        title: "Implementation Manager",
        slug: "implementation-manager",
        location: "Atlanta, GA",
        jobType: JobType.FULL_TIME,
        workSetting: WorkSetting.HYBRID,
        team: "Customer Success",
        level: "Mid-level",
        description:
          "Own rollout plans, onboard users, and surface insights from deployments across Fortune 500 clients.",
        applyUrl:
          "https://northwindlabs.example.com/jobs/implementation-manager",
        status: JobStatus.PUBLISHED,
        tags: ["Customer Success", "Retail", "Project Management"],
      },
    ],
    recruiter: {
      name: "Priya Patel",
      email: "talent@northwind.demo",
      role: RecruiterRole.OWNER,
      passcode: "northwind-2025",
    },
  },
  {
    name: "Astro Foods",
    slug: "astrofoods",
    headline: "Design the future of zero-waste kitchens.",
    subheadline:
      "Astro Foods builds smart kitchen devices and software that help culinary teams scale sustainable dining programs.",
    story:
      "We partner with hospitality groups and universities to measure emissions, automate ordering, and showcase the people behind each dish.",
    mission: "Delicious, sustainable meals everywhere.",
    headquarters: "Denver, CO · On-site friendly",
    website: "https://astrofoods.example.com",
    sizeRange: "250-400",
    industries: ["Food Tech", "Hardware"],
    values: [
      {
        title: "People eat stories",
        description:
          "We invest in photography, copy, and video that center chefs and diners.",
      },
      {
        title: "Design in service",
        description:
          "Engineers rotate through customer kitchens monthly to observe workflows in the real world.",
      },
    ],
    perks: [
      {
        label: "Chef-crafted lunches",
        description: "Daily meals cooked by our culinary R&D team.",
      },
      {
        label: "Sabbatical program",
        description: "One month paid sabbatical every four years.",
      },
    ],
    theme: {
      primaryColor: "#022c22",
      secondaryColor: "#34d399",
      accentColor: "#f97316",
      backgroundColor: "#fffbeb",
      heroBackground: "linear-gradient(135deg, #f59e0b, #f97316)",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17",
      logoUrl: "https://dummyimage.com/160x40/022c22/ffffff&text=Astro",
      cultureVideoUrl: "https://www.youtube.com/watch?v=3fumBcKC6RE",
      eyebrow: "Circular economy kitchens",
    },
    sections: [
      {
        title: "About Astro Foods",
        kind: SectionType.ABOUT,
        summary: "Circular kitchens",
        content:
          "We pair IoT sensors with menu planning software to cut waste by 35% on average.",
        sortOrder: 1,
      },
      {
        title: "Our perks",
        kind: SectionType.BENEFITS,
        summary: "Fuel for real life",
        content:
          "Comprehensive healthcare, equitable parental leave, transportation stipends, and learning budgets.",
        sortOrder: 2,
      },
      {
        title: "Life at Astro",
        kind: SectionType.LIFE_AT_COMPANY,
        summary: "Cook + build together",
        content:
          "We host monthly community dinners, field trips with restaurant partners, and volunteer days at local farms.",
        sortOrder: 3,
      },
    ],
    jobs: [
      {
        title: "Firmware Engineer",
        slug: "firmware-engineer",
        location: "Denver, CO",
        jobType: JobType.FULL_TIME,
        workSetting: WorkSetting.ONSITE,
        team: "Embedded Systems",
        level: "Mid-level",
        description:
          "Design the next-gen sensor stack powering our kitchen intelligence platform.",
        applyUrl: "https://astrofoods.example.com/jobs/firmware-engineer",
        status: JobStatus.DRAFT,
        tags: ["C++", "Microcontrollers"],
      },
      {
        title: "Field Marketing Manager",
        slug: "field-marketing-manager",
        location: "Remote, US",
        jobType: JobType.CONTRACT,
        workSetting: WorkSetting.HYBRID,
        team: "Marketing",
        level: "Contract",
        description:
          "Launch pop-up experiences and chef residencies across partner campuses.",
        applyUrl:
          "https://astrofoods.example.com/jobs/field-marketing-manager",
        status: JobStatus.PUBLISHED,
        tags: ["Events", "Brand"],
        featured: true,
      },
    ],
    recruiter: {
      name: "Samira Lopez",
      email: "people@astrofoods.demo",
      role: RecruiterRole.OWNER,
      passcode: "astro-2025",
    },
  },
];

async function main() {
  await prisma.job.deleteMany();
  await prisma.section.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.company.deleteMany();

  for (const company of seedCompanies) {
    const passcodeHash = await bcrypt.hash(company.recruiter.passcode, 10);

    await prisma.company.create({
      data: {
        name: company.name,
        slug: company.slug,
        headline: company.headline,
        subheadline: company.subheadline,
        story: company.story,
        mission: company.mission,
        headquarters: company.headquarters,
        website: company.website,
        sizeRange: company.sizeRange,
        industries: company.industries,
        perks: company.perks,
        values: company.values,
        theme: {
          create: {
            primaryColor: company.theme.primaryColor,
            secondaryColor: company.theme.secondaryColor,
            accentColor: company.theme.accentColor,
            backgroundColor: company.theme.backgroundColor,
            heroBackground: company.theme.heroBackground,
            bannerImageUrl: company.theme.bannerImageUrl,
            logoUrl: company.theme.logoUrl,
            cultureVideoUrl: company.theme.cultureVideoUrl,
            eyebrow: company.theme.eyebrow,
            ctaLabel: "Explore open roles",
            ctaUrl: `/${company.slug}/careers#open-roles`,
          },
        },
        sections: {
          create: company.sections.map((section) => ({
            title: section.title,
            slug: section.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, ""),
            kind: section.kind,
            summary: section.summary,
            content: section.content,
            sortOrder: section.sortOrder,
          })),
        },
        jobs: {
          create: company.jobs.map((job) => ({
            title: job.title,
            slug: job.slug,
            location: job.location,
            jobType: job.jobType,
            workSetting: job.workSetting,
            team: job.team,
            level: job.level,
            minSalary: job.minSalary,
            maxSalary: job.maxSalary,
            salaryCurrency: "USD",
            description: job.description,
            applyUrl: job.applyUrl,
            status: job.status,
            tags: job.tags,
            featured: job.featured ?? false,
            publishedAt:
              job.status === JobStatus.PUBLISHED ? new Date() : undefined,
          })),
        },
        recruiters: {
          create: {
            name: company.recruiter.name,
            email: company.recruiter.email,
            role: company.recruiter.role,
            passcodeHash,
          },
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });

