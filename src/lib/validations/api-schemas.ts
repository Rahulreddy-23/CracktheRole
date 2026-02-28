import { z } from "zod";

// ─── Interview Chat ──────────────────────────────────────────────
export const chatRequestSchema = z.object({
    sessionId: z.string().uuid("sessionId must be a valid UUID"),
    messages: z
        .array(
            z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().min(1, "Message content cannot be empty"),
            })
        )
        .min(1, "At least one message is required"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

// ─── Interview Score ─────────────────────────────────────────────
export const scoreRequestSchema = z.object({
    sessionId: z.string().uuid("sessionId must be a valid UUID"),
});

export type ScoreRequest = z.infer<typeof scoreRequestSchema>;

// ─── Practice Bookmark ──────────────────────────────────────────
export const bookmarkRequestSchema = z.object({
    questionId: z.string().uuid("questionId must be a valid UUID"),
    action: z.enum(["add", "remove"], "action must be 'add' or 'remove'"),
});

export type BookmarkRequest = z.infer<typeof bookmarkRequestSchema>;

// ─── Salary POST ─────────────────────────────────────────────────
export const salaryPostSchema = z.object({
    company: z.string().min(1, "company is required"),
    role: z.string().min(1, "role is required"),
    experience_years: z.number().int().min(0).max(50),
    base_salary: z.number().positive("base_salary must be positive"),
    bonus: z.number().min(0).optional().default(0),
    esop_value: z.number().min(0).optional().default(0),
    total_ctc: z.number().positive("total_ctc must be positive"),
    city: z.string().optional().default("bangalore"),
});

export type SalaryPostRequest = z.infer<typeof salaryPostSchema>;

// ─── Helper ──────────────────────────────────────────────────────
/**
 * Format Zod errors into a human-readable string for API responses.
 */
export function formatZodErrors(error: z.ZodError): string {
    return error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
}
