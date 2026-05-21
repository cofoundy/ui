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

  it("renders MessageContent for user messages", () => {
    const userMessage: MessageType = { ...baseMessage, role: "user" };
    const { container } = render(<Message message={userMessage} />);
    expect(container.querySelector(".cf-stream-root")).toBeNull();
    expect(container.querySelector(".cf-stream-char")).toBeNull();
    expect(container.querySelector("h2")?.textContent).toBe("Hello");
  });

  it("renders StreamingMarkdown with cf-stream-active class when isStreamingThis", () => {
    useChatStore.setState({ isStreaming: true, streamingMessageId: "msg-1" });
    const { container } = render(<Message message={baseMessage} />);
    const root = container.querySelector(".cf-stream-root");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("cf-stream-active")).toBe(true);
    expect(container.querySelectorAll(".cf-stream-char").length).toBeGreaterThan(0);
  });

  it("renders StreamingMarkdown WITHOUT cf-stream-active when streaming a different message", () => {
    useChatStore.setState({ isStreaming: true, streamingMessageId: "msg-other" });
    const { container } = render(<Message message={baseMessage} />);
    const root = container.querySelector(".cf-stream-root");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("cf-stream-active")).toBe(false);
  });

  it("keeps StreamingMarkdown rendered when stream finishes — only drops cf-stream-active", () => {
    useChatStore.setState({ isStreaming: true, streamingMessageId: "msg-1" });
    const { container, rerender } = render(<Message message={baseMessage} />);
    const rootDuring = container.querySelector(".cf-stream-root");
    expect(rootDuring).not.toBeNull();
    expect(rootDuring?.classList.contains("cf-stream-active")).toBe(true);

    act(() => {
      useChatStore.getState().finishStreaming();
    });
    rerender(<Message message={baseMessage} />);

    const rootAfter = container.querySelector(".cf-stream-root");
    expect(rootAfter).not.toBeNull();
    expect(rootAfter?.classList.contains("cf-stream-active")).toBe(false);
    // h2 still styled via StreamingMarkdown's inline BLOCK_STYLES (1.35em),
    // not collapsed to browser default like it would be with MessageContent's `prose` class.
    expect(container.querySelector("h2")?.textContent).toBe("Hello");
  });
});
