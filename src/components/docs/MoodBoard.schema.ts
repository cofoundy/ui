import { z } from 'zod';

const moodBoardItemSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().max(280).optional(),
  source_url: z.string().url().optional(),
  concept_tag: z.string().max(40).optional(),
});

export const moodBoardSchema = z.object({
  items: z.array(moodBoardItemSchema).min(1).max(24),
  columns: z.number().int().min(1).max(6).optional(),
});

export type MoodBoardInput = z.infer<typeof moodBoardSchema>;
