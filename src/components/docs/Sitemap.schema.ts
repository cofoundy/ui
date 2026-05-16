import { z } from 'zod';

const baseNodeSchema = z.object({
  path: z.string().min(1),
  label: z.string().min(1),
  depth: z.number().int().min(0).max(10).optional(),
  intent: z.string().max(60).optional(),
  nav_group: z.string().max(60).optional(),
});

// Recursive type via z.lazy
export type SitemapNodeInput = z.infer<typeof baseNodeSchema> & {
  children?: SitemapNodeInput[];
};

export const sitemapNodeSchema: z.ZodType<SitemapNodeInput> = baseNodeSchema.extend({
  children: z.lazy(() => z.array(sitemapNodeSchema).optional()),
});

export const sitemapSchema = z.object({
  nodes: z.array(sitemapNodeSchema).min(1).max(200),
  defaultExpanded: z.boolean().optional(),
  density: z.enum(['compact', 'comfortable']).optional(),
});

export type SitemapInput = z.infer<typeof sitemapSchema>;
