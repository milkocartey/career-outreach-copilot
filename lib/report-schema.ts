import { z } from "zod";

export const leadSchema = z.object({
  company: z.string(),
  website: z.string(),
  location: z.string(),
  whyFit: z.string(),
  sources: z.array(z.string()),
  confidence: z.enum(["verified", "likely", "unverified"]),
  channel: z.enum(["email", "linkedin_message", "job_posting"]),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  subject: z.string().optional(),
  linkedinProfileUrl: z.string().optional(),
  jobPostingUrl: z.string().optional(),
  messageBody: z.string(),
});

export const reportSchema = z.object({
  summary: z.string(),
  leads: z.array(leadSchema),
});

export type Lead = z.infer<typeof leadSchema>;
export type Report = z.infer<typeof reportSchema>;
