import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BarChart } from '../../components/analytics/BarChart'

describe('BarChart', () => {
  it('renders one bar per datum', () => {
    const { container } = render(
      <BarChart
        data={[
          { label: 'a', value: 10 },
          { label: 'b', value: 20 },
        ]}
        animate={false}
      />
    )
    expect(container.querySelectorAll('[data-slot="bar-chart-bar"]')).toHaveLength(2)
  })

  it('renders positive-only data anchored to the baseline (unchanged behavior)', () => {
    const { container } = render(
      <BarChart data={[{ label: 'a', value: 100 }]} animate={false} />
    )
    const bar = container.querySelector('[data-slot="bar-chart-bar"]') as HTMLElement
    expect(bar.getAttribute('data-sign')).toBe('positive')
    // tallest bar fills the positive region
    expect(bar.style.height).toBe('100%')
  })

  it('renders NEGATIVE values as a visible bar below the zero baseline', () => {
    // Regression: negatives used to map to a negative CSS height, clamped to 0,
    // showing only the 2px min-height sliver at the baseline.
    const { container } = render(
      <BarChart
        data={[
          { label: 'pos', value: 100 },
          { label: 'neg', value: -100 },
        ]}
        animate={false}
      />
    )
    const bars = Array.from(
      container.querySelectorAll('[data-slot="bar-chart-bar"]')
    ) as HTMLElement[]
    const neg = bars.find((b) => b.getAttribute('data-sign') === 'negative')
    expect(neg).toBeTruthy()
    // The negative bar must have a real, positive height (not "-100%" / "0%")
    expect(neg!.style.height).toBe('100%')
    expect(neg!.style.height.startsWith('-')).toBe(false)
  })

  it('draws a zero baseline when the domain crosses zero', () => {
    const { container } = render(
      <BarChart
        data={[
          { label: 'pos', value: 30 },
          { label: 'neg', value: -10 },
        ]}
        animate={false}
      />
    )
    expect(container.querySelector('[data-slot="bar-chart-baseline"]')).toBeTruthy()
    // positive 30 / max 30 => full positive region; negative 10 / min 10 => full negative region
    const bars = Array.from(
      container.querySelectorAll('[data-slot="bar-chart-bar"]')
    ) as HTMLElement[]
    expect(bars.find((b) => b.getAttribute('data-sign') === 'positive')!.style.height).toBe('100%')
    expect(bars.find((b) => b.getAttribute('data-sign') === 'negative')!.style.height).toBe('100%')
  })

  it('does NOT draw a baseline for all-positive data', () => {
    const { container } = render(
      <BarChart
        data={[
          { label: 'a', value: 10 },
          { label: 'b', value: 20 },
        ]}
        animate={false}
      />
    )
    expect(container.querySelector('[data-slot="bar-chart-baseline"]')).toBeNull()
  })
})
