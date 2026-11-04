import type { Meta, StoryObj } from '@storybook/react';
import { LogoHeader, Wordmark } from '../../components/ui/logo-header';
import { BrandGrid, BrandPanel } from './BrandPanel';
import { ROWS, VARIANT_TABLE_MD, rowLabel } from './brandRule';

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
        '`color` ↔ `*-color` · `mono` ↔ `*-white` · `flat` ↔ `*-pure-white`. En `mono` y `flat` el wordmark hereda `currentColor`. Cuál usar: tabla «Qué variante usar» (arriba).',
    },
    mono: { table: { disable: true } },
    wordmarkOnly: { table: { disable: true } },
    isologoOnly: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Logo de Cofoundy: isologo + wordmark «Cofoundy» (Space Grotesk Semibold, -0.02em). Es la fuente de los archivos de `handbook/positioning/BRAND/assets/logo/` (`make-stacked.py`). Regla de uso: `identity.md` §02. Solo los cubos → `Logo`; solo el texto → `Wordmark`.\n' +
          VARIANT_TABLE_MD,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LogoHeader>;

export const Default: Story = {
  name: 'Playground (controles)',
  args: { size: 'lg', layout: 'horizontal', variant: 'color' },
};

export const Sizes: Story = {
  name: 'Tamaños · fila 1 (claro → *-color)',
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

/** Horizontal: las cuatro filas de la tabla «Qué variante usar» (identity.md §02). */
export const Variants: Story = {
  name: 'Qué variante usar (filas 1–4)',
  render: () => (
    <BrandGrid>
      <BrandPanel theme="light" title={rowLabel(ROWS.claro)} rule="Cotización, web en modo claro, firma de correo.">
        <LogoHeader size="lg" variant="color" />
      </BrandPanel>
      <BrandPanel theme="dark" title={rowLabel(ROWS.oscuroGrande)} rule="Portada de PDF, slide, hero, video.">
        <LogoHeader size="lg" variant="mono" className="text-white" />
      </BrandPanel>
      <BrandPanel theme="dark" title={rowLabel(ROWS.oscuroChico)} rule="Header de app, sello en footer.">
        <LogoHeader size="sm" variant="flat" className="text-white" />
      </BrandPanel>
      <BrandPanel theme="dark" surface="brand" title={rowLabel(ROWS.deColor)} rule="Co-branding, sobre una foto o un degradado.">
        <LogoHeader size="lg" variant="flat" className="text-white" />
      </BrandPanel>
    </BrandGrid>
  ),
};

/** Logo apilado oficial: las mismas filas. Cada tarjeta es la fuente de su archivo `logo-stacked-*` del BRAND. */
export const Stacked: Story = {
  name: 'Apilado · filas 1–4',
  args: { size: 'lg', layout: 'stacked' },
  render: (args) => (
    <BrandGrid>
      <BrandPanel theme="light" title={rowLabel(ROWS.claro)} rule="Archivo: logo-stacked-color">
        <LogoHeader {...args} variant="color" />
      </BrandPanel>
      <BrandPanel theme="dark" title={rowLabel(ROWS.oscuroGrande)} rule="Archivo: logo-stacked-white">
        <LogoHeader {...args} variant="mono" className="text-white" />
      </BrandPanel>
      <BrandPanel theme="dark" title={rowLabel(ROWS.oscuroChico)} rule="Archivo: logo-stacked-pure-white">
        <LogoHeader {...args} size="sm" variant="flat" className="text-white" />
      </BrandPanel>
      <BrandPanel theme="dark" surface="brand" title={rowLabel(ROWS.deColor)} rule="Archivo: logo-stacked-pure-white (foto de grupo)">
        <LogoHeader {...args} variant="flat" className="text-white" />
      </BrandPanel>
    </BrandGrid>
  ),
};

export const StackedSizes: Story = {
  name: 'Tamaños de apilado · fila 1 (claro → *-color)',
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
  name: 'En un header · fila 1 (claro → *-color)',
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
