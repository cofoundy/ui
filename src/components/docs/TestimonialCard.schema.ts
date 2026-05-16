import { z } from 'zod';

export const testimonialCardSchema = z.object({
  quote: z.string().min(1).max(500),
  author: z.string().min(1),
  role: z.string().optional(),
  avatar: z.string().url().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});

export type TestimonialCardInput = z.infer<typeof testimonialCardSchema>;
