
import { z } from "zod";
import { positions } from "./constants";

export const intakeFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  position: z.string().min(1, "Please select a position"),
  availability: z
    .number()
    .min(1, "Must be at least 1 hour")
    .max(168, "Cannot exceed 168 hours (7 days * 24 hours)"),
  dreamerStatement: z
    .string()
    .min(100, "Statement must be at least 100 characters long"),
  resume: z.any(),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;
