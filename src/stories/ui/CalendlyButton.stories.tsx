import type { Meta, StoryObj } from '@storybook/react';
import { CalBookingButton } from '../../components/ui/calendly-button';

const meta: Meta<typeof CalBookingButton> = {
  title: 'UI/CalBookingButton',
  component: CalBookingButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A button that opens a Cal.com popup modal for scheduling appointments. Loads Cal.com embed script lazily on first click.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    showIcon: {
      control: 'boolean',
      description: 'Show calendar icon',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Icon position',
    },
    url: {
      control: 'text',
      description: 'Cal.com booking URL',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalBookingButton>;

const DEMO_URL = 'https://cal.cofoundy.dev/team/cofoundy/discovery';

export const Primary: Story = {
  args: {
    url: DEMO_URL,
    variant: 'primary',
    size: 'md',
    children: 'Agendar llamada gratis',
  },
};

export const Secondary: Story = {
  args: {
    url: DEMO_URL,
    variant: 'secondary',
    size: 'md',
    children: 'Agendar demo',
  },
};

export const Outline: Story = {
  args: {
    url: DEMO_URL,
    variant: 'outline',
    size: 'md',
    children: 'Ver disponibilidad',
  },
};

export const Ghost: Story = {
  args: {
    url: DEMO_URL,
    variant: 'ghost',
    size: 'md',
    children: 'Agendar ahora',
  },
};

export const Small: Story = {
  args: {
    url: DEMO_URL,
    variant: 'primary',
    size: 'sm',
    children: 'Agendar',
  },
};

export const Large: Story = {
  args: {
    url: DEMO_URL,
    variant: 'primary',
    size: 'lg',
    children: 'Agendar llamada de descubrimiento',
  },
};

export const WithoutIcon: Story = {
  args: {
    url: DEMO_URL,
    variant: 'primary',
    size: 'md',
    showIcon: false,
    children: 'Reservar cita',
  },
};

export const IconRight: Story = {
  args: {
    url: DEMO_URL,
    variant: 'primary',
    size: 'md',
    iconPosition: 'right',
    children: 'Agendar llamada',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <CalBookingButton url={DEMO_URL} variant="primary" size="lg">
          Primary Large
        </CalBookingButton>
        <CalBookingButton url={DEMO_URL} variant="secondary" size="lg">
          Secondary Large
        </CalBookingButton>
      </div>
      <div className="flex items-center gap-4">
        <CalBookingButton url={DEMO_URL} variant="outline" size="md">
          Outline Medium
        </CalBookingButton>
        <CalBookingButton url={DEMO_URL} variant="ghost" size="md">
          Ghost Medium
        </CalBookingButton>
      </div>
      <div className="flex items-center gap-4">
        <CalBookingButton url={DEMO_URL} variant="primary" size="sm">
          Small
        </CalBookingButton>
        <CalBookingButton url={DEMO_URL} variant="primary" size="sm" showIcon={false}>
          No Icon
        </CalBookingButton>
      </div>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div
      className="p-8 rounded-xl max-w-md text-center"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <h2 className="text-2xl font-bold mb-2">¿Listo para empezar?</h2>
      <p className="text-[var(--muted-foreground)] mb-6">
        Agenda una llamada de 30 minutos para discutir tu proyecto.
      </p>
      <CalBookingButton url={DEMO_URL} variant="primary" size="lg" className="w-full">
        Agendar llamada gratis
      </CalBookingButton>
    </div>
  ),
};
