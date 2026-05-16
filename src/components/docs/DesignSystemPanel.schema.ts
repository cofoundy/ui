import { z } from 'zod';

const colorTokenSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  usage_note: z.string().max(120).optional(),
});

const typeTokenSchema = z.object({
  name: z.string().min(1),
  family: z.string().min(1),
  sample: z.string().max(200).optional(),
  weight: z.string().optional(),
});

const namedValueSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

export const designSystemPanelSchema = z.object({
  colors: z.array(colorTokenSchema).optional(),
  typography: z.array(typeTokenSchema).optional(),
  spacing: z.array(namedValueSchema).optional(),
  radius: z.array(namedValueSchema).optional(),
  direction: z.string().max(60).optional(),
});

export type DesignSystemPanelInput = z.infer<typeof designSystemPanelSchema>;
