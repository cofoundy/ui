"use client";

import type { Message as MessageType } from "../../types";
import { ToolIndicator } from "./ToolIndicator";

interface ToolGroupProps {
  tools: MessageType[];
}

/**
 * Displays tool indicators as a vertical list (git log style)
 */
export function ToolGroup({ tools }: ToolGroupProps) {
  if (tools.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5 pl-4 my-2">
      {tools.map((tool) => (
        <ToolIndicator key={tool.id} message={tool} compact />
      ))}
    </div>
  );
}
