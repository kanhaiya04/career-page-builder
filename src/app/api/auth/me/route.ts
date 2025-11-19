import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ session: null });
  }

  const recruiter = await prisma.recruiter.findUnique({
    where: { id: session.recruiterId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return NextResponse.json({ session: recruiter });
}

