import { JobStatus, JobType, WorkSetting, Department, ExperienceLevel } from "@prisma/client";
import { z } from "zod";

export const jobCreateSchema = z.object({
  title: z.string().min(3).max(120),
  location: z.string().min(2),
  jobType: z.nativeEnum(JobType),
  workSetting: z.nativeEnum(WorkSetting),
  description: z.string(),
  applyUrl: z.string().url(),
  status: z.nativeEnum(JobStatus),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().optional(),
  department: z.nativeEnum(Department),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  salaryRange: z.string().min(1),
});

export const jobUpdateSchema = jobCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;

