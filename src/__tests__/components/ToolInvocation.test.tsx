import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig } from "framer-motion";
import { ToolInvocation, ToolInvocationGroup } from "../../index";

function renderReduced(ui: React.ReactElement) {
  return render(<MotionConfig reducedMotion="always">{ui}</MotionConfig>);
}

describe("ToolInvocation", () => {
  it("renders name, summary and the completed status, folded by default", () => {
    renderReduced(
      <ToolInvocation
        name="Consultar tarifario"
        summary="Consultó tarifario MSL · Ningbo"
        input={{ carrier: "MSL", origin: "Ningbo" }}
        output={{ rate: 399 }}
      />,
    );
    const button = screen.getByRole("button", { name: /Consultar tarifario/ });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Consultó tarifario MSL · Ningbo")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.queryByText("Input")).toBeNull();
  });

  it("toggles with the keyboard and shows the input as a key/value list", async () => {
    const user = userEvent.setup();
    renderReduced(
      <ToolInvocation name="Calcular" input={{ carrier: "MSL", wm: 4.2 }} output="USD 399" />,
    );
    const button = screen.getByRole("button", { name: /Calcular/ });
    button.focus();
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("carrier")).toBeInTheDocument();
    expect(screen.getByText("4.2")).toBeInTheDocument();
    expect(screen.getByText("USD 399")).toBeInTheDocument();
    await user.keyboard(" ");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("pretty-prints a JSON string output and keeps a truncated one as text", () => {
    const { container, rerender } = renderReduced(
      <ToolInvocation name="t" defaultOpen output='{"success": true, "items": [1, 2]}' />,
    );
    expect(container.querySelector('[data-slot="tool-invocation-list"], pre')?.textContent).toContain(
      "success",
    );
    rerender(
      <MotionConfig reducedMotion="always">
        <ToolInvocation name="t" defaultOpen output='{"success": true, "data": "abc…' />
      </MotionConfig>,
    );
    expect(screen.getByText('{"success": true, "data": "abc…')).toBeInTheDocument();
  });

  it("renders nested input as JSON, not a list", () => {
    const { container } = renderReduced(
      <ToolInvocation name="t" defaultOpen input={{ a: { b: 1 } }} />,
    );
    const pre = container.querySelector('[data-slot="tool-invocation-code"]');
    expect(pre?.textContent).toContain('"b": 1');
  });

  it("shows the error state with role=alert", () => {
    renderReduced(
      <ToolInvocation name="t" state="output-error" errorText="Tarifario no encontrado" defaultOpen />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Tarifario no encontrado");
    expect(screen.getAllByText("Error").length).toBeGreaterThan(0);
  });

  it("lets every label be overridden", () => {
    renderReduced(
      <ToolInvocation
        name="t"
        state="input-available"
        defaultOpen
        input={{ x: 1 }}
        labels={{ running: "Ejecutando", input: "Entrada", output: "Salida", waiting: "Esperando…" }}
      />,
    );
    expect(screen.getByText("Ejecutando")).toBeInTheDocument();
    expect(screen.getByText("Entrada")).toBeInTheDocument();
    expect(screen.getByText("Salida")).toBeInTheDocument();
    expect(screen.getByText("Esperando…")).toBeInTheDocument();
  });

  it("renders a ReactNode output as-is and calls onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderReduced(
      <ToolInvocation name="t" onOpenChange={onOpenChange} output={<strong>rich</strong>} />,
    );
    await user.click(screen.getByRole("button"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByText("rich").tagName).toBe("STRONG");
  });
});

describe("ToolInvocationGroup", () => {
  it("counts its children, flags errors and is folded by default", async () => {
    const user = userEvent.setup();
    renderReduced(
      <ToolInvocationGroup>
        <ToolInvocation name="Uno" />
        <ToolInvocation name="Dos" />
        <ToolInvocation name="Tres" state="output-error" errorText="x" />
      </ToolInvocationGroup>,
    );
    const header = screen.getByRole("button", { name: /AI ran 3 actions/ });
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("1 error")).toBeInTheDocument();
    expect(screen.queryByText("Uno")).toBeNull();
    await user.click(header);
    expect(screen.getByText("Uno")).toBeInTheDocument();
  });

  it("accepts a localized title function", () => {
    renderReduced(
      <ToolInvocationGroup labels={{ title: (n) => `La IA hizo ${n} acciones` }}>
        <ToolInvocation name="Uno" />
        <ToolInvocation name="Dos" />
      </ToolInvocationGroup>,
    );
    expect(screen.getByText("La IA hizo 2 acciones")).toBeInTheDocument();
  });
});
