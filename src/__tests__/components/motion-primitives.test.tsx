import * as React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Toaster, toast } from "../../components/ui/sonner";

describe("Switch — two-edge knob", () => {
  it("renders the three edge layers inside the thumb and toggles", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Modo operador" onCheckedChange={onChange} />);
    const sw = screen.getByRole("switch");
    expect(sw).toHaveAttribute("data-size", "default");
    const thumb = sw.querySelector('[data-slot="switch-thumb"]')!;
    expect(thumb.querySelectorAll(".cf-edge-l .cf-edge-c .cf-edge-r")).toHaveLength(1);
    fireEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("marks pointer-down for the first-frame reach and clears it on release", () => {
    const onPointerDown = vi.fn();
    render(<Switch aria-label="x" size="lg" onPointerDown={onPointerDown} />);
    const sw = screen.getByRole("switch");
    expect(sw).toHaveAttribute("data-size", "lg");
    fireEvent.pointerDown(sw);
    expect(sw).toHaveAttribute("data-pressed");
    expect(onPointerDown).toHaveBeenCalled();
    fireEvent.pointerUp(sw);
    expect(sw).not.toHaveAttribute("data-pressed");
  });
});

describe("Tabs — travelling pill", () => {
  function Demo() {
    const [v, setV] = React.useState("a");
    return (
      <Tabs value={v} onValueChange={setV}>
        <TabsList>
          <TabsTrigger value="a">Todas</TabsTrigger>
          <TabsTrigger value="b">Mías</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A</TabsContent>
        <TabsContent value="b">B</TabsContent>
      </Tabs>
    );
  }

  it("adds one hidden pill without changing the tab roles", () => {
    render(<Demo />);
    const list = screen.getByRole("tablist");
    const pill = list.querySelector('[data-slot="tabs-pill"]')!;
    expect(pill).toHaveAttribute("aria-hidden", "true");
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(pill.getAttribute("style")).toContain("--cf-edge-l");
  });

  it("forwards the list ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Tabs defaultValue="a">
        <TabsList ref={ref}>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(ref.current).toBe(screen.getByRole("tablist"));
  });
});

describe("Toaster", () => {
  it("keeps sonner's bottom-right default so existing apps don't move", async () => {
    render(<Toaster />);
    act(() => { toast("x"); });
    const ol = await waitFor(() => {
      const el = document.querySelector("[data-sonner-toaster]");
      expect(el).not.toBeNull();
      return el!;
    });
    expect(ol).toHaveAttribute("data-x-position", "right");
  });

  it("bottom-center opt-in clips at the dock and restyles the action", async () => {
    render(<Toaster position="bottom-center" dock={72} />);
    act(() => {
      toast.error("No se pudo asignar", { action: { label: "Deshacer", onClick: () => {} } });
    });
    const ol = await waitFor(() => {
      const el = document.querySelector("[data-sonner-toaster]");
      expect(el).not.toBeNull();
      return el!;
    });
    expect(ol).toHaveClass("cf-toaster", "cf-toaster--dock");
    expect(ol).toHaveAttribute("data-y-position", "bottom");
    expect(ol).toHaveAttribute("data-x-position", "center");
    expect((ol as HTMLElement).style.getPropertyValue("--mobile-offset-bottom")).toBe("84px");
    expect(await screen.findByRole("button", { name: "Deshacer" })).toHaveClass("cf-toast-action");
  });
});
