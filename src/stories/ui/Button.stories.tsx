import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button, type ButtonStatus } from '../../components/ui/button';
import { Send, Plus, Check, X } from 'lucide-react';
import { VIEWPORT_MOBILE } from '../_shared/viewports';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Send className="w-4 h-4 mr-2" />
        Send Message
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    children: <Plus className="w-4 h-4" />,
    size: 'icon',
    'aria-label': 'Add',
  },
};

/**
 * Mobile-first contract baseline (375 px, iPhone SE). Verifies 44×44 px tap
 * targets at `size='lg'` and that the default size remains usable on mobile.
 * Required per packages/ui/CLAUDE.md → "Mobile-state stories".
 */
export const MobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <Button size="lg">Primary CTA (lg ≥ 44 px)</Button>
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button size="icon" aria-label="Add">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap items-center">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex gap-4 flex-wrap items-center">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex gap-4 flex-wrap items-center">
        <Button size="icon-sm"><Check className="w-3 h-3" /></Button>
        <Button size="icon"><Check className="w-4 h-4" /></Button>
        <Button size="icon-lg"><Check className="w-5 h-5" /></Button>
      </div>
    </div>
  ),
};

/* ------------------------------------------------------------------------ */
/* status — morph in place                                                   */
/* ------------------------------------------------------------------------ */

function StatusDemo({ fail, full }: { fail?: boolean; full?: boolean }) {
  const [text, setText] = React.useState('Hola, te confirmo la cita del jueves.');
  const [status, setStatus] = React.useState<ButtonStatus>('idle');
  const [failNext, setFailNext] = React.useState(!!fail);
  const save = () => {
    setStatus('loading');
    window.setTimeout(() => {
      setStatus(failNext ? 'error' : 'success');
      setFailNext(false); // the retry succeeds
    }, 900);
  };
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <textarea
        aria-label="Respuesta rápida"
        className="min-h-20 rounded-md bg-[var(--muted)] p-2 text-base text-[var(--foreground)]"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus('idle'); // success persists until the content changes
        }}
      />
      <div className={full ? 'grid' : 'flex'}>
        <Button status={status} onClick={save} className={full ? 'w-full' : undefined} size="lg">
          Guardar respuesta
        </Button>
      </div>
      <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <input type="checkbox" checked={failNext} onChange={(e) => setFailNext(e.target.checked)} />
        El próximo guardado falla
      </label>
    </div>
  );
}

/**
 * `status` is opt-in: the tapped button answers (Guardando → Guardada / No se guardó ·
 * Reintentar). Success persists until the content changes; the error click is the retry and
 * the user's text is untouched. No toast for "saved".
 */
export const Status: Story = {
  render: () => <StatusDemo />,
};

export const StatusError: Story = {
  render: () => <StatusDemo fail />,
};

/** Every designed state, pinned. The width is reserved for the longest state words. */
export const StatusStates: Story = {
  render: () => (
    <div className="grid gap-6 text-xs text-[var(--muted-foreground)]">
      {(['default', 'outline', 'destructive'] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-4">
          {(['idle', 'loading', 'success', 'error'] as const).map((st) => (
            <div key={st} className="grid justify-items-center gap-2">
              <Button variant={variant} status={st} size="lg">
                Guardar
              </Button>
              <span>
                {variant} · {st}
              </span>
            </div>
          ))}
          <div className="grid justify-items-center gap-2">
            <Button variant={variant} status="idle" size="lg" disabled>
              Guardar
            </Button>
            <span>{variant} · disabled</span>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const StatusMobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  render: () => (
    <div className="p-4">
      <StatusDemo full />
    </div>
  ),
};
