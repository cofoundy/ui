import { z } from 'zod';

const buildStepSchema = z.object({
  label: z.string().min(1),
  status: z.enum(['done', 'current', 'pending']).optional(),
  // `body` is ReactNode in TS — at schema level allow plain string for MDX authoring.
  body: z.union([z.string(), z.unknown()]).optional(),
  phase: z.enum(['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9']).optional(),
  owner: z.string().max(60).optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  vikunja_project_id: z.number().int().positive().optional(),
});

export const buildProgressSchema = z.object({
  steps: z.array(buildStepSchema).min(1).max(20),
});

export type BuildProgressInput = z.infer<typeof buildProgressSchema>;
