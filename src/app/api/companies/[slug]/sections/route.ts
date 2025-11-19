import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeApiCompany } from "@/lib/auth/api";
import {
  sectionCreateSchema,
} from "@/lib/validators/section";
import { slugify } from "@/lib/strings";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const auth = await authorizeApiCompany(slug);
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const includeDraft = url.searchParams.get("includeDraft") === "true";

  const sections = await prisma.section.findMany({
    where: {
      company: { slug },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ sections });
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const auth = await authorizeApiCompany(slug);
  if ("error" in auth) return auth.error;

  const json = await request.json().catch(() => null);
  const parsed = sectionCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, summary, content, sortOrder } =
    parsed.data;

  const created = await prisma.section.create({
    data: {
      title,
      slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`,
      summary,
      content,
      sortOrder: sortOrder ?? 100,
      company: {
        connect: { slug },
      },
    },
  });

  return NextResponse.json({ section: created }, { status: 201 });
}

