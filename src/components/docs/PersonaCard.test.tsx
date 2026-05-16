import { describe, it, expect, expectTypeOf } from 'vitest';
import { render } from '@testing-library/react';
import { PersonaCard, type PersonaCardProps } from './PersonaCard';
import { personaCardSchema, type PersonaCardInput } from './PersonaCard.schema';

const canonical: PersonaCardInput = {
  name: 'John Medina',
  role: 'Cofounder, XGodel',
  avatar: 'https://example.com/avatar.png',
  demographics: ['Lima, Peru', '32 años'],
  painPoints: ['Demasiados leads no calificados', 'Branding inconsistente'],
  goals: ['Cerrar 3 cuentas enterprise en Q3', 'Reducir time-to-MQL <48h'],
  quote: 'Necesito que mi sitio refleje seriedad académica sin parecer aburrido.',
  jtbd: 'Cuando un VC visita nuestra landing, quiero que perciba rigor inmediato.',
  objections: ['No tenemos presupuesto este mes', 'Ya tenemos un dev interno'],
  journeyStage: 'decision',
  age: '30-35',
  incomeRange: 'S/.12k-20k/mes',
  source: 'ux-research/02-user-personas.md',
};

describe('PersonaCard schema', () => {
  it('parses canonical example', () => {
    expect(() => personaCardSchema.parse(canonical)).not.toThrow();
  });

  it('matches TS interface', () => {
    expectTypeOf<PersonaCardInput>().toMatchTypeOf<PersonaCardProps>();
    expectTypeOf<Pick<PersonaCardProps, 'name' | 'role'>>().toMatchTypeOf<Pick<PersonaCardInput, 'name' | 'role'>>();
  });

  it('rejects missing required `name`', () => {
    const bad = { ...canonical, name: undefined } as unknown;
    const result = personaCardSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects missing required `role`', () => {
    const bad = { ...canonical, role: undefined } as unknown;
    const result = personaCardSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects unknown journeyStage', () => {
    const bad = { ...canonical, journeyStage: 'purchase' } as unknown;
    const result = personaCardSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});

describe('PersonaCard render', () => {
  it('renders all enrichment fields', () => {
    const { getByText, container } = render(<PersonaCard {...canonical} />);
    expect(getByText('John Medina')).toBeTruthy();
    expect(getByText(/Cofounder, XGodel/)).toBeTruthy();
    expect(getByText(/Jobs to be done/i)).toBeTruthy();
    expect(getByText(/Objections/i)).toBeTruthy();
    expect(container.querySelector('[data-slot="persona-card-journey"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="persona-card-source"]')).toBeTruthy();
  });

  it('renders minimal valid props (back-compat)', () => {
    const { getByText } = render(<PersonaCard name="Min" role="Test" />);
    expect(getByText('Min')).toBeTruthy();
    expect(getByText('Test')).toBeTruthy();
  });
});
