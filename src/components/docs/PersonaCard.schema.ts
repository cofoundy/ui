import { z } from 'zod';

export const personaCardSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  avatar: z.string().url().optional(),
  demographics: z.array(z.string()).max(8).optional(),
  painPoints: z.array(z.string()).max(8).optional(),
  goals: z.array(z.string()).max(8).optional(),
  quote: z.string().max(500).optional(),
  // Atelier §6.2 patch additions:
  jtbd: z.string().max(280).optional(),
  objections: z.array(z.string()).max(6).optional(),
  journeyStage: z.enum(['awareness', 'research', 'decision', 'retention']).optional(),
  age: z.string().optional(),
  incomeRange: z.string().optional(),
  /** Provenance — future gate `unverified_persona`. */
  source: z.string().optional(),
});

export type PersonaCardInput = z.infer<typeof personaCardSchema>;
