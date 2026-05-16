import { describe, it, expect, expectTypeOf } from 'vitest';
import { render } from '@testing-library/react';
import { ComparisonMatrix, type ComparisonMatrixProps } from './ComparisonMatrix';
import { comparisonMatrixSchema, type ComparisonMatrixInput } from './ComparisonMatrix.schema';

const canonical = {
  columns: ['Direction A', 'Direction B', 'Direction C'],
  rows: [
    {
      feature: 'Academic feel',
      source: 'visual-design/DECISIONS.md',
      options: [
        { name: 'A', value: 'High', traffic_light: 'green' as const, highlight: true },
        { name: 'B', value: 'Medium', traffic_light: 'yellow' as const },
        { name: 'C', value: 'Low', traffic_light: 'red' as const },
      ],
    },
    {
      feature: 'Mobile perf',
      options: [
        { name: 'A', value: 'Excellent', traffic_light: 'green' as const },
        { name: 'B', value: 'Good', traffic_light: 'green' as const },
        { name: 'C', value: 'OK', traffic_light: 'yellow' as const },
      ],
    },
  ],
};

describe('ComparisonMatrix schema', () => {
  it('parses canonical example', () => {
    expect(() => comparisonMatrixSchema.parse(canonical)).not.toThrow();
  });

  it('matches TS interface', () => {
    // Schema models `rows[].options[].value` as `string | number | boolean | unknown`
    // (MDX-authorable); component declares `ReactNode`. Compare shapes excluding
    // that one field — deliberate runtime-vs-render divergence.
    type SchemaRow = NonNullable<ComparisonMatrixInput['rows']>[number];
    type SchemaSubset = Omit<ComparisonMatrixInput, 'rows'> & {
      rows: Array<Omit<SchemaRow, 'options'> & {
        options: Array<Omit<SchemaRow['options'][number], 'value'>>;
      }>;
    };
    type PropsRow = ComparisonMatrixProps['rows'][number];
    type PropsSubset = Omit<ComparisonMatrixProps, 'rows'> & {
      rows: Array<Omit<PropsRow, 'options'> & {
        options: Array<Omit<PropsRow['options'][number], 'value'>>;
      }>;
    };
    expectTypeOf<SchemaSubset>().toMatchTypeOf<PropsSubset>();
  });

  it('rejects empty columns', () => {
    expect(comparisonMatrixSchema.safeParse({ columns: [], rows: [{ feature: 'x', options: [{ name: 'a', value: 'b' }] }] }).success).toBe(false);
  });

  it('rejects row without required `feature`', () => {
    expect(comparisonMatrixSchema.safeParse({ columns: ['A'], rows: [{ options: [{ name: 'a', value: 'b' }] }] }).success).toBe(false);
  });

  it('rejects invalid traffic_light', () => {
    expect(
      comparisonMatrixSchema.safeParse({
        columns: ['A'],
        rows: [{ feature: 'x', options: [{ name: 'a', value: 'b', traffic_light: 'blue' }] }],
      }).success,
    ).toBe(false);
  });
});

describe('ComparisonMatrix render', () => {
  it('renders traffic-light dots + row source', () => {
    const { container, getByText } = render(<ComparisonMatrix {...(canonical as ComparisonMatrixProps)} />);
    expect(container.querySelectorAll('[data-slot="comparison-matrix-traffic-light"]').length).toBeGreaterThan(0);
    expect(container.querySelector('[data-slot="comparison-matrix-source"]')).toBeTruthy();
    expect(getByText('Direction A')).toBeTruthy();
  });
});
