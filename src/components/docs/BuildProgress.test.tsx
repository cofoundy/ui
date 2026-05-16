import { describe, it, expect, expectTypeOf } from 'vitest';
import { render } from '@testing-library/react';
import { BuildProgress, type BuildProgressProps } from './BuildProgress';
import { buildProgressSchema, type BuildProgressInput } from './BuildProgress.schema';

const canonical = {
  steps: [
    { label: 'Brief', status: 'done' as const, phase: 'L0' as const, owner: 'Andre', started_at: '2026-05-01', completed_at: '2026-05-02', vikunja_project_id: 22 },
    { label: 'UX Research', status: 'done' as const, phase: 'L2' as const, owner: 'Percy' },
    { label: 'Visual Direction', status: 'current' as const, phase: 'L4' as const, owner: 'Percy', started_at: '2026-05-10' },
    { label: 'Build', status: 'pending' as const, phase: 'L6' as const },
  ],
};

describe('BuildProgress schema', () => {
  it('parses canonical example', () => {
    expect(() => buildProgressSchema.parse(canonical)).not.toThrow();
  });

  it('matches TS interface', () => {
    // Schema models `steps[].body` as `string | unknown` (MDX/runtime-friendly);
    // component declares `ReactNode` (render-friendly). Compare shapes excluding
    // that one field — it's a deliberate runtime-vs-render divergence.
    type SchemaSubset = Omit<BuildProgressInput, 'steps'> & {
      steps: Array<Omit<NonNullable<BuildProgressInput['steps']>[number], 'body'>>;
    };
    type PropsSubset = Omit<BuildProgressProps, 'steps'> & {
      steps: Array<Omit<BuildProgressProps['steps'][number], 'body'>>;
    };
    expectTypeOf<SchemaSubset>().toMatchTypeOf<PropsSubset>();
  });

  it('rejects empty steps array', () => {
    expect(buildProgressSchema.safeParse({ steps: [] }).success).toBe(false);
  });

  it('rejects step without required `label`', () => {
    expect(buildProgressSchema.safeParse({ steps: [{}] }).success).toBe(false);
  });

  it('rejects invalid phase', () => {
    expect(buildProgressSchema.safeParse({ steps: [{ label: 'x', phase: 'L99' }] }).success).toBe(false);
  });
});

describe('BuildProgress render', () => {
  it('renders phase, owner, dates, vikunja id', () => {
    const { container, getByText } = render(<BuildProgress {...(canonical as BuildProgressProps)} />);
    expect(container.querySelector('[data-slot="build-progress-phase"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="build-progress-meta"]')).toBeTruthy();
    expect(getByText(/owner: Andre/)).toBeTruthy();
    expect(getByText(/vikunja: #22/)).toBeTruthy();
  });

  it('renders minimal back-compat shape', () => {
    const { getByText } = render(<BuildProgress steps={[{ label: 'Solo' }]} />);
    expect(getByText('Solo')).toBeTruthy();
  });
});
