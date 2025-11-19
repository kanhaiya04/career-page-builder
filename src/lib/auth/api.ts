import { NextResponse } from "next/server";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "./session";

const getCachedCompanyId = cache(async (slug: string) => {
  return prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });
});

export async function authorizeApiCompany(slug: string) {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const company = await getCachedCompanyId(slug);

  if (!company) {
    return {
      error: NextResponse.json({ error: "Company not found" }, { status: 404 }),
    };
  }

  if (company.id !== session.companyId) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { company };
}

