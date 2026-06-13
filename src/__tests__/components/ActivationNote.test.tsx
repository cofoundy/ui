import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivationNote } from "../../components/ui/activation-note";

describe("ActivationNote", () => {
  it("renders its children (copy is a slot)", () => {
    render(<ActivationNote>Access activates when this email signs in.</ActivationNote>);
    expect(
      screen.getByText("Access activates when this email signs in.")
    ).toBeInTheDocument();
  });

  it("marks the root with data-slot", () => {
    const { container } = render(<ActivationNote>note</ActivationNote>);
    expect(
      container.querySelector('[data-slot="activation-note"]')
    ).toBeInTheDocument();
  });

  it("renders the inset variant (default) with the wider measure", () => {
    const { container } = render(<ActivationNote>note</ActivationNote>);
    const note = container.querySelector('[data-slot="activation-note"]')!;
    expect(note.className).toContain("max-w-[48ch]");
  });

  it("renders the inline variant with the tighter measure", () => {
    const { container } = render(
      <ActivationNote variant="inline">note</ActivationNote>
    );
    const note = container.querySelector('[data-slot="activation-note"]')!;
    expect(note.className).toContain("max-w-[54ch]");
  });

  it("forwards a ref to the paragraph element", () => {
    let node: HTMLParagraphElement | null = null;
    render(
      <ActivationNote
        ref={(el) => {
          node = el;
        }}
      >
        note
      </ActivationNote>
    );
    expect(node).toBeInstanceOf(HTMLParagraphElement);
  });
});
