import { JobStatus, Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

const companySelect = Prisma.validator<Prisma.CompanyInclude>()({
  theme: true,
  sections: {
    orderBy: { sortOrder: "asc" },
  },
  jobs: {
    orderBy: [
      { featured: "desc" },
      { createdAt: "desc" },
    ],
  },
});

export const getCompanyPublic = cache(async (slug: string) => {
  return prisma.company.findUnique({
    where: { slug },
    include: {
      ...companySelect,
      sections: {
        orderBy: { sortOrder: "asc" },
      },
      jobs: {
        orderBy: [
          { featured: "desc" },
          { createdAt: "desc" },
        ],
        where: { status: JobStatus.PUBLISHED },
      },
    },
  });
});

export const getCompanyForEditor = cache(async (slug: string) => {
  return prisma.company.findUnique({
    where: { slug },
    include: companySelect,
  });
});

