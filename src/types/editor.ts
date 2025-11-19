import type { Company, Job, Section, Theme } from "@prisma/client";

export type EditorCompany = Company & {
  theme: Theme | null;
  sections: Section[];
  jobs: Job[];
};

