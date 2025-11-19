import { z } from "zod";

const urlOrEmpty = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "")
  .pipe(
    z
      .string()
      .url()
      .or(z.literal(""))
  )
  .transform((value) => (value === "" ? undefined : value));

const emptyToUndefined = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined) return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  });

export const themeUpdateSchema = z.object({
  headline: z
    .string({ message: "Headline is required" })
    .min(6)
    .max(180),
  subheadline: emptyToUndefined,
  mission: emptyToUndefined,
  story: emptyToUndefined,
  headquarters: emptyToUndefined,
  website: urlOrEmpty,
  sizeRange: emptyToUndefined,
  industries: z.array(z.string()).optional().default([]),
  showSalary: z.boolean().default(true),
  theme: z.object({
    primaryColor: z.string().min(4),
    secondaryColor: z.string().min(4),
    accentColor: z.string().min(4),
    backgroundColor: z.string().min(4),
    heroBackground: emptyToUndefined,
    bannerImageUrl: urlOrEmpty,
    logoUrl: urlOrEmpty,
    cultureVideoUrl: urlOrEmpty,
    eyebrow: emptyToUndefined,
  }),
});

export type ThemeUpdateInput = z.infer<typeof themeUpdateSchema>;

