import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { Button } from "../../components/ui/button";

const meta: Meta<typeof Collapsible> = {
  title: "UI/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-[350px] space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">
            @peduarte starred 3 repositories
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border border-[var(--border)] px-4 py-3 font-mono text-sm">
          @radix-ui/primitives
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border border-[var(--border)] px-4 py-3 font-mono text-sm">
            @radix-ui/colors
          </div>
          <div className="rounded-md border border-[var(--border)] px-4 py-3 font-mono text-sm">
            @stitches/react
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const DefaultOpen: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-[350px] space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">Files</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border border-[var(--border)] px-4 py-3 font-mono text-sm">
          index.tsx
        </div>
        <div className="rounded-md border border-[var(--border)] px-4 py-3 font-mono text-sm">
          styles.css
        </div>
        <div className="rounded-md border border-[var(--border)] px-4 py-3 font-mono text-sm">
          utils.ts
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const NestedCollapsibles: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Collapsible defaultOpen>
        <div className="flex items-center justify-between space-x-4 rounded-md border border-[var(--border)] px-4 py-2">
          <h4 className="text-sm font-semibold">Section 1</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-2 space-y-2 pl-4">
          <div className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm">
            Item 1.1
          </div>
          <div className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm">
            Item 1.2
          </div>
          <Collapsible>
            <div className="flex items-center justify-between space-x-4 rounded-md border border-[var(--border)] px-4 py-2">
              <h4 className="text-sm font-medium">Subsection 1.3</h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-2 space-y-2 pl-4">
              <div className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm">
                Item 1.3.1
              </div>
              <div className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm">
                Item 1.3.2
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible>
        <div className="flex items-center justify-between space-x-4 rounded-md border border-[var(--border)] px-4 py-2">
          <h4 className="text-sm font-semibold">Section 2</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-2 space-y-2 pl-4">
          <div className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm">
            Item 2.1
          </div>
          <div className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm">
            Item 2.2
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};
