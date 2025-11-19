import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "./session";

export async function requireRecruiterSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

const getCachedCompany = cache(async (slug: string) => {
  return prisma.company.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
});

export async function requireCompanyEditor(slug: string) {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=/${slug}/edit`);
  }

  const company = await getCachedCompany(slug);

  if (!company) {
    notFound();
  }

  if (company.id !== session.companyId) {
    redirect("/login?error=unauthorized");
  }

  return { session, company };
}

export async function requireCompanyPreview(slug: string) {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=/${slug}/preview`);
  }

  const company = await getCachedCompany(slug);

  if (!company) {
    notFound();
  }

  const canPreview = company.id === session.companyId;

  if (!canPreview) {
    redirect("/login?error=unauthorized");
  }

  return { session, company };
}

