import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeApiCompany } from "@/lib/auth/api";
import { sectionUpdateSchema } from "@/lib/validators/section";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ slug: string; sectionId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { slug, sectionId } = await params;
  const auth = await authorizeApiCompany(slug);
  if ("error" in auth) return auth.error;

  const json = await request.json().catch(() => null);
  const parsed = sectionUpdateSchema.safeParse({
    ...json,
    id: sectionId,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id, ...data } = parsed.data;

  const updated = await prisma.section.update({
    where: { id },
    data,
  });

  return NextResponse.json({ section: updated });
}

export async function DELETE(_: Request, { params }: Params) {
  const { slug, sectionId } = await params;
  const auth = await authorizeApiCompany(slug);
  if ("error" in auth) return auth.error;

  await prisma.section.delete({
    where: { id: sectionId },
  });

  return NextResponse.json({ ok: true });
}

