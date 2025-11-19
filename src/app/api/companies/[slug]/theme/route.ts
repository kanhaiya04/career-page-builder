import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { themeUpdateSchema } from "@/lib/validators/company";
import { authorizeApiCompany } from "@/lib/auth/api";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { slug } = await params;
  const auth = await authorizeApiCompany(slug);
  if ("error" in auth) return auth.error;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: { theme: true },
  });

  return NextResponse.json({ company });
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;
  const auth = await authorizeApiCompany(slug);
  if ("error" in auth) return auth.error;

  const json = await request.json().catch(() => null);
  const parsed = themeUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    headline,
    subheadline,
    mission,
    story,
    headquarters,
    website,
    sizeRange,
    industries,
    showSalary,
    theme,
  } = parsed.data;

  const themeData = {
    ...theme,
    heroBackground: theme.heroBackground ?? null,
    bannerImageUrl: theme.bannerImageUrl ?? null,
    logoUrl: theme.logoUrl ?? null,
    cultureVideoUrl: theme.cultureVideoUrl ?? null,
    eyebrow: theme.eyebrow ?? null,
  };

  const updated = await prisma.$transaction(async (tx) => {
    const company = await tx.company.update({
      where: { slug },
      data: {
        headline,
        subheadline: subheadline ?? null,
        mission: mission ?? null,
        story: story ?? null,
        headquarters: headquarters ?? null,
        website: website ?? null,
        sizeRange: sizeRange ?? null,
        industries,
        showSalary,
      },
      select: { id: true },
    });

    await tx.theme.upsert({
      where: { companyId: company.id },
      create: { ...themeData, companyId: company.id },
      update: themeData,
    });

    return tx.company.findUnique({
      where: { slug },
      include: { theme: true },
    });
  });

  return NextResponse.json({ company: updated });
}

