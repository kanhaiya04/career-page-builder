import { NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeApiCompany } from "@/lib/auth/api";
import { jobUpdateSchema } from "@/lib/validators/job";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ slug: string; jobId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { slug, jobId } = await params;
  const auth = await authorizeApiCompany(slug);
  if ("error" in auth) return auth.error;

  const json = await request.json().catch(() => null);
  const parsed = jobUpdateSchema.safeParse({ ...json, id: jobId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id, status, ...data } = parsed.data;

  const updated = await prisma.job.update({
    where: { id },
    data: {
      ...data,
      status,
      publishedAt:
        status === JobStatus.PUBLISHED ? new Date() : undefined,
    },
  });

  return NextResponse.json({ job: updated });
}

export async function DELETE(_: Request, { params }: Params) {
  const { slug, jobId } = await params;
  const auth = await authorizeApiCompany(slug);
  if ("error" in auth) return auth.error;

  await prisma.job.delete({
    where: { id: jobId },
  });

  return NextResponse.json({ ok: true });
}

