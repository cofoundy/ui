"use client";

import type { Message as MessageType } from "../../types";
import { ToolIndicator } from "./ToolIndicator";

interface ToolGroupProps {
  tools: MessageType[];
}

/**
 * Displays multiple tool indicators in a horizontal flex layout.
 * Tools are displayed as compact pills that wrap on smaller screens.
 */
export function ToolGroup({ tools }: ToolGroupProps) {
  if (tools.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center my-2">
      {tools.map((tool) => (
        <ToolIndicator key={tool.id} message={tool} compact />
      ))}
    </div>
  );
}
