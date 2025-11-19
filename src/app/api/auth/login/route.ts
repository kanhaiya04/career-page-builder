import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";
import { createSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);

  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, passcode } = parsed.data;

  const recruiter = await prisma.recruiter.findUnique({
    where: { email },
    include: {
      company: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!recruiter) {
    return NextResponse.json(
      { error: "Invalid email or passcode" },
      { status: 401 }
    );
  }

  const validPasscode = await bcrypt.compare(passcode, recruiter.passcodeHash);

  if (!validPasscode) {
    return NextResponse.json(
      { error: "Invalid email or passcode" },
      { status: 401 }
    );
  }

  await prisma.recruiter.update({
    where: { id: recruiter.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    recruiterId: recruiter.id,
    companyId: recruiter.company.id,
    role: recruiter.role,
  });

  return NextResponse.json({
    ok: true,
    company: recruiter.company,
  });
}

