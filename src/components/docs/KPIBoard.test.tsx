import { describe, it, expect, expectTypeOf } from 'vitest';
import { render } from '@testing-library/react';
import { KPIBoard, type KPIBoardProps } from './KPIBoard';
import { kpiBoardSchema, type KPIBoardInput } from './KPIBoard.schema';

const canonical = {
  kpis: [
    {
      label: 'MQL → SQL',
      value: '34%',
      trend: { direction: 'up' as const, value: '+6pt' },
      target: '40%',
      baseline: '28% (Q1)',
      status: 'good' as const,
      source: 'research/16-cro-plan.md',
    },
    {
      label: 'CAC',
      value: 'S/.420',
      trend: { direction: 'down' as const, value: '-S/.80' },
      status: 'good' as const,
    },
    {
      label: 'Time-to-MQL',
      value: '52h',
      target: '<48h',
      status: 'warn' as const,
    },
  ],
};

describe('KPIBoard schema', () => {
  it('parses canonical example', () => {
    expect(() => kpiBoardSchema.parse(canonical)).not.toThrow();
  });

  it('matches TS interface', () => {
    // Schema models `kpis[].value` as `string | number | unknown` (MDX-authorable);
    // component declares `ReactNode`. Compare shapes excluding that one field —
    // deliberate runtime-vs-render divergence.
    type SchemaSubset = Omit<KPIBoardInput, 'kpis'> & {
      kpis: Array<Omit<NonNullable<KPIBoardInput['kpis']>[number], 'value'>>;
    };
    type PropsSubset = Omit<KPIBoardProps, 'kpis'> & {
      kpis: Array<Omit<KPIBoardProps['kpis'][number], 'value'>>;
    };
    expectTypeOf<SchemaSubset>().toMatchTypeOf<PropsSubset>();
  });

  it('rejects empty kpis', () => {
    expect(kpiBoardSchema.safeParse({ kpis: [] }).success).toBe(false);
  });

  it('rejects kpi without required `label`', () => {
    expect(kpiBoardSchema.safeParse({ kpis: [{ value: '1' }] }).success).toBe(false);
  });

  it('rejects invalid trend direction', () => {
    expect(
      kpiBoardSchema.safeParse({
        kpis: [{ label: 'x', value: '1', trend: { direction: 'sideways', value: '0' } }],
      }).success,
    ).toBe(false);
  });
});

describe('KPIBoard render', () => {
  it('renders baseline + source slots', () => {
    const { container, getByText } = render(<KPIBoard {...(canonical as KPIBoardProps)} />);
    expect(container.querySelector('[data-slot="kpi-baseline"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="kpi-source"]')).toBeTruthy();
    expect(getByText('MQL → SQL')).toBeTruthy();
  });
});
