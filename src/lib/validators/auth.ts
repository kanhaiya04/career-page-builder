import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Enter a valid email"),
  passcode: z
    .string({ message: "Passcode is required" })
    .min(4, "Passcode must be at least 4 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  companyName: z
    .string({ message: "Company name is required" })
    .min(3)
    .max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and dashes",
    })
    .optional(),
  recruiterName: z
    .string({ message: "Your name is required" })
    .min(2)
    .max(60),
  recruiterEmail: z
    .string({ message: "Email is required" })
    .email("Enter a valid email"),
  passcode: z
    .string({ message: "Passcode is required" })
    .min(6, "Passcode must be at least 6 characters"),
  headline: z
    .string()
    .optional(),
  subheadline: z
    .string()
    .optional(),
});

export type SignupInput = z.input<typeof signupSchema>;

