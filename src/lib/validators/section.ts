import { z } from "zod";

export const sectionCreateSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  summary: z.string().optional(),
  content: z.string(),
  sortOrder: z.number().int().optional(),
});

export const sectionUpdateSchema = sectionCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export type SectionCreateInput = z.infer<typeof sectionCreateSchema>;
export type SectionUpdateInput = z.infer<typeof sectionUpdateSchema>;

