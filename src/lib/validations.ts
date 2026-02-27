import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const interviewSetupSchema = z.object({
  jobRole: z.string().min(1, "Please select a job role"),
  difficulty: z.enum(["junior", "mid", "senior", "staff"]),
  interviewType: z.enum([
    "behavioral",
    "technical",
    "system-design",
    "coding",
    "mixed",
  ]),
  targetCompany: z.string().optional(),
  durationMinutes: z.number().min(10).max(60),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  jobTitle: z.string().optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const salaryQuerySchema = z.object({
  role: z.string().min(1, "Please enter a role"),
  experience: z.number().min(0).max(50),
  location: z.string().min(1, "Please enter a location"),
  skills: z.array(z.string()).min(1, "Please add at least one skill"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type InterviewSetupFormData = z.infer<typeof interviewSetupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type SalaryQueryFormData = z.infer<typeof salaryQuerySchema>;
