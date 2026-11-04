import type { Meta, StoryObj } from '@storybook/react';
import { LogoHeader, Wordmark } from '../../components/ui/logo-header';
import { BrandGrid, BrandPanel } from './BrandPanel';

const meta: Meta<typeof LogoHeader> = {
  title: 'UI/LogoHeader',
  component: LogoHeader,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl'],
      description: 'Tamaño del lockup',
    },
    layout: {
      control: 'inline-radio',
      options: ['horizontal', 'stacked'],
      description:
        '`horizontal` para headers, barras y cabeceras de documento · `stacked` (cubos arriba, «Cofoundy» debajo) para portadas centradas y avatares',
    },
    variant: {
      control: 'inline-radio',
      options: ['color', 'mono', 'flat'],
      description:
        '`color` colores de marca · `mono` blanco con relieve sobre oscuro neutro · `flat` un color plano (sobre color, chico, mono oscuro). En `mono` y `flat` el wordmark hereda `currentColor`.',
    },
    mono: { table: { disable: true } },
    wordmarkOnly: { table: { disable: true } },
    isologoOnly: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Logo de Cofoundy: isologo + wordmark «Cofoundy» (Space Grotesk Semibold, -0.02em). Es la fuente de los archivos de `handbook/positioning/BRAND/assets/logo/` (`make-stacked.py`). Regla de uso: `identity.md` §02. Solo los cubos → `Logo`; solo el texto → `Wordmark`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LogoHeader>;

export const Default: Story = {
  args: { size: 'lg', layout: 'horizontal', variant: 'color' },
};

export const Sizes: Story = {
  render: () => (
    <div data-theme="light" className="flex flex-col gap-6 rounded-xl bg-background p-8">
      {(['sm', 'default', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex items-center gap-6">
          <span className="w-14 text-xs text-muted-foreground">{size}</span>
          <LogoHeader size={size} />
        </div>
      ))}
    </div>
  ),
};

/** Horizontal: qué variante va sobre qué fondo. */
export const Variants: Story = {
  render: () => (
    <BrandGrid>
      <BrandPanel theme="light" title="color · fondo claro" rule="Default: web, documentos, cotizaciones.">
        <LogoHeader size="default" />
      </BrandPanel>
      <BrandPanel theme="dark" title="mono · oscuro neutro" rule="Blanco con relieve, mediano o grande.">
        <LogoHeader size="default" variant="mono" className="text-white" />
      </BrandPanel>
      <BrandPanel theme="dark" surface="brand" title="flat · sobre color" rule="Sobre el color de un cliente o de la marca.">
        <LogoHeader size="default" variant="flat" className="text-white" />
      </BrandPanel>
      <BrandPanel theme="light" title="flat · un color sobre claro" rule="Una tinta (impresión, sello). Nunca mono con relieve.">
        <LogoHeader size="default" variant="flat" className="text-foreground" />
      </BrandPanel>
    </BrandGrid>
  ),
};

/** Logo apilado oficial. Mismas reglas; es la fuente de `logo-stacked-*` del BRAND. */
export const Stacked: Story = {
  args: { size: 'lg', layout: 'stacked' },
  render: (args) => (
    <BrandGrid>
      <BrandPanel theme="light" title="color · fondo claro" rule="logo-stacked-color">
        <LogoHeader {...args} variant="color" />
      </BrandPanel>
      <BrandPanel theme="dark" title="mono · oscuro neutro" rule="logo-stacked-white (relieve)">
        <LogoHeader {...args} variant="mono" className="text-white" />
      </BrandPanel>
      <BrandPanel theme="dark" surface="brand" title="flat · color de cliente" rule="logo-stacked-pure-white">
        <LogoHeader {...args} variant="flat" className="text-white" />
      </BrandPanel>
      <BrandPanel theme="light" title="flat oscuro · fondo claro" rule="Una tinta oscura">
        <LogoHeader {...args} variant="flat" className="text-foreground" />
      </BrandPanel>
    </BrandGrid>
  ),
};

export const StackedSizes: Story = {
  render: () => (
    <div data-theme="light" className="flex flex-wrap items-end gap-10 rounded-xl bg-background p-8">
      {(['sm', 'default', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <LogoHeader size={size} layout="stacked" />
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const InHeader: Story = {
  render: () => (
    <header data-theme="light" className="flex w-full max-w-4xl items-center justify-between gap-12 rounded-xl border border-border bg-background px-8 py-4">
      <LogoHeader size="default" />
      <nav className="flex items-center gap-8 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground">Productos</a>
        <a href="#" className="hover:text-foreground">Nosotros</a>
        <a href="#" className="hover:text-foreground">Contacto</a>
      </nav>
    </header>
  ),
};

/** Wordmark suelto: es texto, se dimensiona con `text-*` y se colorea con `text-*`. */
export const WordmarkStandalone: Story = {
  render: () => (
    <div data-theme="light" className="flex flex-col gap-4 rounded-xl bg-background p-8">
      <Wordmark className="text-lg" />
      <Wordmark className="text-2xl" />
      <Wordmark className="text-4xl text-primary" />
    </div>
  ),
};
