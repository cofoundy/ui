import type { Meta, StoryObj } from '@storybook/react';
import { CofoundyBadge } from '../../components/ui/cofoundy-badge';

const meta: Meta<typeof CofoundyBadge> = {
  title: 'UI/CofoundyBadge',
  component: CofoundyBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['professional', 'shimmer', 'pill', 'friendly'],
      description: 'Badge style variant',
    },
    prefix: {
      control: 'text',
      description: 'Text before "Cofoundy"',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Atribución «Hecho por Cofoundy» para el footer de proyectos de clientes y demos. Enlaza a cofoundy.dev. `professional` (default) para sitios corporativos · `pill` para footers oscuros y minimalistas · `shimmer` en demos y lanzamientos · `friendly` en marcas cálidas (salud, comida, comunidad).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center min-h-[100px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CofoundyBadge>;

export const Default: Story = {
  args: { variant: 'professional' },
};

export const CustomPrefix: Story = {
  args: { variant: 'professional', prefix: 'Built by' },
  name: 'Prefijo propio (inglés)',
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          professional — cubo color + texto azul de marca · sitios corporativos
        </p>
        <CofoundyBadge variant="professional" />
      </div>
      <div className="text-center">
        <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          shimmer — cubo color + brillo animado · demos y lanzamientos
        </p>
        <CofoundyBadge variant="shimmer" />
      </div>
      <div className="text-center">
        <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          pill — cápsula + cubo flat · footers oscuros minimalistas
        </p>
        <CofoundyBadge variant="pill" />
      </div>
      <div className="text-center">
        <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          friendly — líneas + cubo + corazón · marcas cálidas
        </p>
        <CofoundyBadge variant="friendly" />
      </div>
    </div>
  ),
  name: 'Variantes y cuándo usarlas',
};

export const InFooterContext: Story = {
  render: () => (
    <div className="w-full max-w-4xl rounded-lg border border-border bg-card p-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-border">
        <p className="text-sm text-muted-foreground">
          © 2026 Proyecto demo. Todos los derechos reservados.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>Términos</span>
          <span>Privacidad</span>
        </div>
      </div>
      <div className="pt-4 text-center">
        <CofoundyBadge variant="pill" />
      </div>
    </div>
  ),
  name: 'En un footer',
};
