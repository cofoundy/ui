import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { TimeSlotGrid } from '../../components/chat-widget/TimeSlotGrid';
import type { TimeSlot } from '../../types';

const meta: Meta<typeof TimeSlotGrid> = {
  title: 'Chat/TimeSlotGrid',
  component: TimeSlotGrid,
  tags: ['autodocs'],
  args: {
    onSelectSlot: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4 bg-[var(--chat-background)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TimeSlotGrid>;

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const formatDate = (date: Date) => {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
};

const todaySlots: TimeSlot[] = [
  { date: formatDate(today), time: '09:00 AM', available: true },
  { date: formatDate(today), time: '10:00 AM', available: true },
  { date: formatDate(today), time: '11:00 AM', available: true },
  { date: formatDate(today), time: '02:00 PM', available: true },
  { date: formatDate(today), time: '03:00 PM', available: true },
];

const tomorrowSlots: TimeSlot[] = [
  { date: formatDate(tomorrow), time: '09:00 AM', available: true },
  { date: formatDate(tomorrow), time: '10:00 AM', available: true },
  { date: formatDate(tomorrow), time: '11:00 AM', available: true },
  { date: formatDate(tomorrow), time: '02:00 PM', available: true },
];

const allSlots = [...todaySlots, ...tomorrowSlots];

export const SingleDay: Story = {
  args: {
    slots: todaySlots,
  },
};

export const MultipleDays: Story = {
  args: {
    slots: allSlots,
  },
};

export const WithTitle: Story = {
  args: {
    slots: todaySlots,
    title: 'Horarios disponibles:',
  },
};

export const FewSlots: Story = {
  args: {
    slots: [
      { date: formatDate(today), time: '10:00 AM', available: true },
      { date: formatDate(today), time: '03:00 PM', available: true },
    ],
  },
};
