import { NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeApiCompany } from "@/lib/auth/api";
import { jobCreateSchema } from "@/lib/validators/job";
import { slugify } from "@/lib/strings";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const auth = await authorizeApiCompany(slug);
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") as JobStatus | null;

  const jobs = await prisma.job.findMany({
    where: {
      company: { slug },
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: [
      { featured: "desc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json({ jobs });
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const auth = await authorizeApiCompany(slug);
  if ("error" in auth) return auth.error;

  const json = await request.json().catch(() => null);
  const parsed = jobCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const created = await prisma.job.create({
    data: {
      ...data,
      slug: `${slugify(data.title)}-${Math.random()
        .toString(36)
        .slice(2, 6)}`,
      tags: data.tags ?? [],
      publishedAt:
        data.status === JobStatus.PUBLISHED ? new Date() : undefined,
      company: {
        connect: { slug },
      },
    },
  });

  return NextResponse.json({ job: created }, { status: 201 });
}

