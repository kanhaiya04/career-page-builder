import { JobStatus, Prisma } from "@prisma/client";
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

export async function getCompanyPublic(slug: string) {
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
}

export async function getCompanyForEditor(slug: string) {
  return prisma.company.findUnique({
    where: { slug },
    include: companySelect,
  });
}

