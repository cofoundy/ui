import { z } from 'zod';

const comparisonOptionSchema = z.object({
  name: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.unknown()]),
  highlight: z.boolean().optional(),
  traffic_light: z.enum(['green', 'yellow', 'red']).optional(),
});

const comparisonRowSchema = z.object({
  feature: z.string().min(1),
  options: z.array(comparisonOptionSchema).min(1).max(8),
  source: z.string().max(200).optional(),
});

export const comparisonMatrixSchema = z.object({
  columns: z.array(z.string()).min(1).max(8),
  rows: z.array(comparisonRowSchema).min(1).max(40),
});

export type ComparisonMatrixInput = z.infer<typeof comparisonMatrixSchema>;
