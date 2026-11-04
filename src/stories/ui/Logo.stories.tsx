import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from '../../components/ui/logo';
import { BrandGrid, BrandPanel } from './BrandPanel';
import { ROWS, VARIANT_TABLE_MD, rowLabel } from './brandRule';

const meta: Meta<typeof Logo> = {
  title: 'UI/Logo',
  component: Logo,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl', '2xl'],
      description: 'Tamaño del isologo (sm 24px · default 40px · lg 64px · xl 96px · 2xl 128px)',
    },
    variant: {
      control: 'inline-radio',
      options: ['color', 'mono', 'flat'],
      description:
        '`color` ↔ `*-color` · `mono` ↔ `*-white` · `flat` ↔ `*-pure-white`. Cuál usar: tabla «Qué variante usar» (arriba).',
    },
    mono: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Isologo de Cofoundy (los cubos). Para la marca completa usa `LogoHeader`. `mono` y `flat` pintan con `currentColor`: el color se da con `text-*`. Es accesible por defecto (`role="img"`, «Cofoundy»); pasa `aria-hidden` si va junto a texto que ya nombra la marca.\n' +
          VARIANT_TABLE_MD,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  name: 'Playground (controles)',
  args: { size: 'xl', variant: 'color' },
};

export const Sizes: Story = {
  name: 'Tamaños · fila 1 (claro → *-color)',
  render: () => (
    <div data-theme="light" className="flex items-end gap-6 rounded-xl bg-background p-8">
      {(['sm', 'default', 'lg', 'xl', '2xl'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Logo size={size} />
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** Las cuatro filas de la tabla «Qué variante usar» (identity.md §02). */
export const Variants: Story = {
  name: 'Qué variante usar (filas 1–4)',
  render: () => (
    <BrandGrid>
      <BrandPanel theme="light" title={rowLabel(ROWS.claro)} rule="Cotización, web en modo claro, firma de correo.">
        <Logo size="xl" variant="color" />
      </BrandPanel>
      <BrandPanel theme="dark" title={rowLabel(ROWS.oscuroGrande)} rule="Portada de PDF, slide, hero, video.">
        <Logo size="xl" variant="mono" className="text-white" />
      </BrandPanel>
      <BrandPanel theme="dark" title={rowLabel(ROWS.oscuroChico)} rule="Favicon, ícono de app, sello en footer.">
        <div className="flex items-end gap-4 text-white">
          <Logo variant="flat" className="h-4 w-4" />
          <Logo variant="flat" className="h-8 w-8" />
          <Logo variant="flat" className="h-12 w-12" />
        </div>
      </BrandPanel>
      <BrandPanel theme="dark" surface="brand" title={rowLabel(ROWS.deColor)} rule="Foto de grupo «X x Cofoundy», co-branding, sobre una foto.">
        <Logo size="xl" variant="flat" className="text-white" />
      </BrandPanel>
    </BrandGrid>
  ),
};

/** Por qué el umbral de 64 px entre las filas 2 y 3: bajo ese tamaño el relieve de `mono` se vuelve ruido gris. */
export const SmallSizes: Story = {
  name: 'Umbral 64 px (filas 2 y 3)',
  render: () => (
    <BrandGrid>
      <BrandPanel theme="dark" title={"Fila 2 fuera de rango\nmono < 64 px"} rule="El relieve se empasta: no usar.">
        <div className="flex items-end gap-4 text-white">
          <Logo variant="mono" className="h-4 w-4" />
          <Logo variant="mono" className="h-8 w-8" />
          <Logo variant="mono" className="h-12 w-12" />
        </div>
      </BrandPanel>
      <BrandPanel theme="dark" title={rowLabel(ROWS.oscuroChico)} rule="Lo correcto a 16–48 px.">
        <div className="flex items-end gap-4 text-white">
          <Logo variant="flat" className="h-4 w-4" />
          <Logo variant="flat" className="h-8 w-8" />
          <Logo variant="flat" className="h-12 w-12" />
        </div>
      </BrandPanel>
    </BrandGrid>
  ),
};
