import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from '../../components/ui/logo';
import { BrandGrid, BrandPanel } from './BrandPanel';

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
        '`color` colores de marca · `mono` blanco con relieve sobre oscuro neutro · `flat` un color plano con caras separadas (chico, sobre color, cualquier mono que no sea blanco)',
    },
    mono: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Isologo de Cofoundy (los cubos). Para la marca completa usa `LogoHeader`. Regla de uso: `handbook/positioning/BRAND/identity.md` §02. `mono` y `flat` pintan con `currentColor`: el color se da con `text-*`. Es accesible por defecto (`role="img"`, «Cofoundy»); pasa `aria-hidden` si va junto a texto que ya nombra la marca.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: { size: 'xl', variant: 'color' },
};

export const Sizes: Story = {
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

/** Una tarjeta por caso real: qué variante va sobre qué fondo. */
export const Variants: Story = {
  render: () => (
    <BrandGrid>
      <BrandPanel theme="light" title="color · fondo claro" rule="Default. Documentos, web, presentaciones.">
        <Logo size="xl" />
      </BrandPanel>
      <BrandPanel theme="dark" title="mono · oscuro neutro" rule="Blanco con relieve. Mediano o grande: portada, slide, hero.">
        <Logo size="xl" variant="mono" className="text-white" />
      </BrandPanel>
      <BrandPanel theme="dark" surface="brand" title="flat · sobre color" rule="Blanco plano sobre el color de un cliente o de la marca.">
        <Logo size="xl" variant="flat" className="text-white" />
      </BrandPanel>
      <BrandPanel theme="light" title="flat · un color sobre claro" rule="Mono oscuro o de acento. Nunca mono con relieve.">
        <Logo size="xl" variant="flat" className="text-foreground" />
      </BrandPanel>
    </BrandGrid>
  ),
};

/** A tamaño chico el relieve se pierde y el color se empasta: ahí va `flat`. */
export const SmallSizes: Story = {
  render: () => (
    <BrandGrid>
      <BrandPanel theme="dark" title="mono · 16–32 px" rule="El relieve se vuelve ruido gris.">
        <div className="flex items-end gap-4 text-white">
          <Logo variant="mono" className="h-4 w-4" />
          <Logo variant="mono" className="h-6 w-6" />
          <Logo variant="mono" className="h-8 w-8" />
        </div>
      </BrandPanel>
      <BrandPanel theme="dark" title="flat · 16–32 px" rule="Favicon, avatar, badges, íconos en línea.">
        <div className="flex items-end gap-4 text-white">
          <Logo variant="flat" className="h-4 w-4" />
          <Logo variant="flat" className="h-6 w-6" />
          <Logo variant="flat" className="h-8 w-8" />
        </div>
      </BrandPanel>
    </BrandGrid>
  ),
};
