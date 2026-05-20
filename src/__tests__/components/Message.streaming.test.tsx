import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Message } from "../../components/chat-widget/Message";
import { useChatStore } from "../../stores/chatStore";
import type { Message as MessageType } from "../../types";

const baseMessage: MessageType = {
  id: "msg-1",
  role: "assistant",
  content: "## Hello\n\n**world**",
  timestamp: new Date("2026-05-20T12:00:00Z"),
};

describe("Message — StreamingMarkdown wiring", () => {
  beforeEach(() => {
    cleanup();
    useChatStore.getState().reset();
  });

  it("renders MessageContent path when not streaming", () => {
    const { container } = render(<Message message={baseMessage} />);
    expect(container.querySelector(".cf-stream-root")).toBeNull();
    expect(container.querySelector(".cf-stream-char")).toBeNull();
    expect(container.querySelector("h2")?.textContent).toBe("Hello");
  });

  it("renders StreamingMarkdown when streamingMessageId matches", () => {
    useChatStore.setState({ isStreaming: true, streamingMessageId: "msg-1" });
    const { container } = render(<Message message={baseMessage} />);
    const root = container.querySelector(".cf-stream-root");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("cf-stream-active")).toBe(true);
    expect(container.querySelectorAll(".cf-stream-char").length).toBeGreaterThan(0);
  });

  it("does NOT use StreamingMarkdown when streaming a different message", () => {
    useChatStore.setState({ isStreaming: true, streamingMessageId: "msg-other" });
    const { container } = render(<Message message={baseMessage} />);
    expect(container.querySelector(".cf-stream-root")).toBeNull();
  });

  it("swaps from StreamingMarkdown to MessageContent when stream finishes", () => {
    useChatStore.setState({ isStreaming: true, streamingMessageId: "msg-1" });
    const { container, rerender } = render(<Message message={baseMessage} />);
    expect(container.querySelector(".cf-stream-root")).not.toBeNull();

    act(() => {
      useChatStore.getState().finishStreaming();
    });
    rerender(<Message message={baseMessage} />);
    expect(container.querySelector(".cf-stream-root")).toBeNull();
    expect(container.querySelector("h2")?.textContent).toBe("Hello");
  });
});
