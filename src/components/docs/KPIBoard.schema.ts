import { z } from 'zod';

const kpiSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number(), z.unknown()]),
  trend: z
    .object({
      direction: z.enum(['up', 'down', 'flat']),
      value: z.string().min(1),
    })
    .optional(),
  target: z.string().optional(),
  status: z.enum(['good', 'warn', 'bad']).optional(),
  baseline: z.string().optional(),
  source: z.string().max(200).optional(),
});

export const kpiBoardSchema = z.object({
  kpis: z.array(kpiSchema).min(1).max(12),
  columns: z.number().int().min(1).max(6).optional(),
});

export type KPIBoardInput = z.infer<typeof kpiBoardSchema>;
