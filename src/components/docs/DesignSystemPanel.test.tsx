import { describe, it, expect, expectTypeOf } from 'vitest';
import { render } from '@testing-library/react';
import { DesignSystemPanel, type DesignSystemPanelProps } from './DesignSystemPanel';
import { designSystemPanelSchema, type DesignSystemPanelInput } from './DesignSystemPanel.schema';

const canonical: DesignSystemPanelInput = {
  direction: 'emerald-academic',
  colors: [
    { name: 'primary', value: '#0F5132', usage_note: 'CTA principal' },
    { name: 'muted', value: '#6B7280', usage_note: 'texto secundario' },
  ],
  typography: [
    { name: 'Heading', family: 'Inter', sample: 'Tu negocio digital', weight: '700' },
    { name: 'Body', family: 'Inter', weight: '400' },
  ],
  spacing: [{ name: 'sm', value: '8px' }, { name: 'md', value: '16px' }],
  radius: [{ name: 'card', value: '14px' }],
};

describe('DesignSystemPanel schema', () => {
  it('parses canonical example', () => {
    expect(() => designSystemPanelSchema.parse(canonical)).not.toThrow();
  });

  it('matches TS interface', () => {
    expectTypeOf<DesignSystemPanelInput>().toMatchTypeOf<DesignSystemPanelProps>();
  });

  it('rejects color token without required `name`', () => {
    expect(designSystemPanelSchema.safeParse({ colors: [{ value: '#fff' }] }).success).toBe(false);
  });

  it('rejects color token without required `value`', () => {
    expect(designSystemPanelSchema.safeParse({ colors: [{ name: 'primary' }] }).success).toBe(false);
  });

  it('accepts empty panel (all sections optional)', () => {
    expect(designSystemPanelSchema.safeParse({}).success).toBe(true);
  });
});

describe('DesignSystemPanel render', () => {
  it('renders direction chip + usage_note', () => {
    const { container, getByText } = render(<DesignSystemPanel {...canonical} />);
    expect(container.querySelector('[data-slot="design-system-panel-direction"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="design-system-panel-usage"]')).toBeTruthy();
    expect(getByText('emerald-academic')).toBeTruthy();
  });
});
