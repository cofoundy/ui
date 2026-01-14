import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchInput } from '../../components/ui/search-input';

const meta: Meta<typeof SearchInput> = {
  title: 'UI/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    showClearButton: {
      control: 'boolean',
      description: 'Whether to show the clear button when there is a value',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    placeholder: 'Search...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Search query',
    placeholder: 'Search...',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Search conversations...',
  },
};

export const NoClearButton: Story = {
  args: {
    showClearButton: false,
    placeholder: 'Search without clear button...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Search disabled...',
  },
};

const ControlledSearch = () => {
  const [value, setValue] = useState('');

  return (
    <div className="w-80">
      <SearchInput
        value={value}
        onChange={setValue}
        placeholder="Type to search..."
      />
      {value && (
        <p className="mt-2 text-sm text-muted-foreground">
          Searching for: "{value}"
        </p>
      )}
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledSearch />,
};

const FilterableList = () => {
  const [search, setSearch] = useState('');
  const items = [
    'Apple',
    'Banana',
    'Cherry',
    'Date',
    'Elderberry',
    'Fig',
    'Grape',
  ];

  const filtered = items.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Filter fruits..."
      />
      <ul className="mt-3 space-y-1">
        {filtered.map((item) => (
          <li
            key={item}
            className="px-3 py-2 text-sm text-foreground bg-card rounded-lg border border-border"
          >
            {item}
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-3 py-2 text-sm text-muted-foreground">
            No results found
          </li>
        )}
      </ul>
    </div>
  );
};

export const FilterableListExample: Story = {
  render: () => <FilterableList />,
};

export const InHeader: Story = {
  render: () => (
    <div className="w-full p-4 bg-card border-b border-border flex items-center justify-between">
      <h2 className="text-lg font-semibold text-foreground">Conversations</h2>
      <div className="w-64">
        <SearchInput placeholder="Search conversations..." />
      </div>
    </div>
  ),
};
