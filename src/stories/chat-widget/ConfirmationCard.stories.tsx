import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmationCard } from '../../components/chat-widget/ConfirmationCard';
import type { Appointment } from '../../types';

const meta: Meta<typeof ConfirmationCard> = {
  title: 'Chat/ConfirmationCard',
  component: ConfirmationCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4 bg-[var(--chat-background)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConfirmationCard>;

export const Default: Story = {
  args: {
    appointment: {
      id: 'apt-1',
      date: '2025-01-15',
      time: '10:00 AM',
      topic: 'Consultoría Landing Page',
      attendees: [],
      confirmed: true,
    },
  },
};

export const WithoutTopic: Story = {
  args: {
    appointment: {
      id: 'apt-2',
      date: '2025-01-20',
      time: '4:30 PM',
      topic: '',
      attendees: [],
      confirmed: true,
    },
  },
};

export const DifferentDates: Story = {
  render: () => (
    <div className="space-y-4">
      <ConfirmationCard
        appointment={{
          id: '1',
          date: '2025-01-15',
          time: '9:00 AM',
          topic: 'Kickoff',
          attendees: [],
          confirmed: true,
        }}
      />
      <ConfirmationCard
        appointment={{
          id: '2',
          date: '2025-02-03',
          time: '2:00 PM',
          topic: 'Review',
          attendees: [],
          confirmed: true,
        }}
      />
      <ConfirmationCard
        appointment={{
          id: '3',
          date: '2025-03-21',
          time: '11:30 AM',
          topic: 'Entrega final',
          attendees: [],
          confirmed: true,
        }}
      />
    </div>
  ),
};
