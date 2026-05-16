import { z } from 'zod';

const quoteMilestoneSchema = z.object({
  label: z.string().min(1).max(120),
  deliverable: z.string().min(1).max(500),
  amount: z.string().min(1).max(40),
  due: z.string().max(40).optional(),
});

export const quoteCardSchema = z.object({
  client_name: z.string().min(1),
  prepared_for: z.string().max(120).optional(),
  valid_until: z.string().max(40).optional(),
  milestones: z.array(quoteMilestoneSchema).min(1).max(12),
  total: z.string().min(1).max(40),
  payment_terms: z.string().min(1).max(500),
  notes: z.string().max(500).optional(),
  tone: z.enum(['default', 'accent']).optional(),
});

export type QuoteCardInput = z.infer<typeof quoteCardSchema>;
