import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validators/auth";
import { slugify } from "@/lib/strings";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    companyName,
    slug,
    recruiterEmail,
    recruiterName,
    passcode,
    headline,
    subheadline,
  } = parsed.data;

  const desiredSlug = (slug ?? slugify(companyName)).toLowerCase();

  const existing = await prisma.company.findUnique({
    where: { slug: desiredSlug },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Slug already taken. Please choose another." },
      { status: 409 }
    );
  }

  const passcodeHash = await bcrypt.hash(passcode, 10);

  const company = await prisma.company.create({
    data: {
      name: companyName,
      slug: desiredSlug,
      headline: headline ?? `Join ${companyName}`,
      subheadline:
        subheadline ??
        "Tell your story, highlight your benefits, and make it easy to browse jobs.",
      showSalary: true,
      theme: {
        create: {
          primaryColor: "#0f172a",
          secondaryColor: "#10b981",
          accentColor: "#fbbf24",
          backgroundColor: "#f0fdfa",
          heroBackground: "linear-gradient(135deg,#0f172a,#0ea5e9)",
          logoUrl: "",
          cultureVideoUrl: "",
          eyebrow: "Careers",
        },
      },
      sections: {
        create: [
          {
            title: "About the team",
            slug: `about-${desiredSlug}`,
            summary: "What you do and how you work.",
            content:
              "Describe your mission, how your teams collaborate, and what success looks like. You can edit or reorder this later.",
            sortOrder: 1,
          },
        ],
      },
      recruiters: {
        create: {
          name: recruiterName,
          email: recruiterEmail,
          role: "OWNER",
          passcodeHash,
        },
      },
    },
    include: {
      theme: true,
    },
  });

  return NextResponse.json(
    {
      company: {
        name: company.name,
        slug: company.slug,
        headline: company.headline,
      },
      recruiter: {
        email: recruiterEmail,
      },
    },
    { status: 201 }
  );
}

