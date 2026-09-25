import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "../../components/ui/button";

/**
 * Markup captured from origin/main BEFORE `status` existed (2026-09-25). Without `status` the
 * Button must render byte-for-byte the same — Fovente, TimelyAI and Landing depend on it.
 */
const BASELINE = {
  plain:
    "<button data-slot=\"button\" data-variant=\"default\" data-size=\"default\" class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*=&#x27;size-&#x27;])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 h-9 px-4 py-2 has-[&gt;svg]:px-3\">Guardar</button>",
  destructive_sm:
    "<button data-slot=\"button\" data-variant=\"destructive\" data-size=\"sm\" class=\"inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*=&#x27;size-&#x27;])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90 h-8 rounded-md gap-1.5 px-3 has-[&gt;svg]:px-2.5 w-full\">Borrar</button>",
  outline_disabled:
    "<button data-slot=\"button\" data-variant=\"outline\" data-size=\"default\" class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*=&#x27;size-&#x27;])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border border-[var(--border)] bg-transparent text-[var(--foreground)] shadow-xs hover:bg-[var(--accent)] h-9 px-4 py-2 has-[&gt;svg]:px-3\" disabled=\"\" type=\"submit\">X</button>",
  asChild:
    "<a href=\"/x\" data-slot=\"button\" data-variant=\"link\" data-size=\"default\" class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*=&#x27;size-&#x27;])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-[var(--primary)] underline-offset-4 hover:underline h-9 px-4 py-2 has-[&gt;svg]:px-3\">Ir</a>",
};

describe("Button without status — render unchanged", () => {
  it.each([
    ["plain", <Button>Guardar</Button>],
    [
      "destructive_sm",
      <Button variant="destructive" size="sm" className="w-full" onClick={() => {}}>
        Borrar
      </Button>,
    ],
    [
      "outline_disabled",
      <Button variant="outline" disabled type="submit">
        X
      </Button>,
    ],
    [
      "asChild",
      <Button asChild variant="link">
        <a href="/x">Ir</a>
      </Button>,
    ],
  ] as const)("%s", (key, el) => {
    expect(renderToStaticMarkup(el)).toBe(BASELINE[key]);
  });

  it("ignores status with asChild (Slot needs a single child)", () => {
    const html = renderToStaticMarkup(
      <Button asChild variant="link" status="loading">
        <a href="/x">Ir</a>
      </Button>
    );
    expect(html).toBe(BASELINE.asChild);
  });
});

function mockReducedMotion(reduced: boolean) {
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches: reduced && query.includes("reduce"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList
  );
}

describe("Button with status", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("idle: same label, empty live region, state words reserved but hidden", () => {
    render(<Button status="idle">Guardar</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-phase", "idle");
    expect(btn).not.toHaveAttribute("aria-busy");
    expect(screen.getByRole("status")).toHaveTextContent("");
    expect(btn.querySelector(".cf-btn__label")).toHaveTextContent("Guardar");
    // width reservation: every state's words are in the cell
    expect(btn.querySelectorAll(".cf-btn__sizer")).toHaveLength(3);
  });

  it("loading: aria-busy, announces the word, swallows clicks and submits", () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" status="loading" onClick={onClick}>
          Guardar
        </Button>
      </form>
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Guardando");
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("success persists and blocks; error is the retry", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button status="success" onClick={onClick}>
        Guardar
      </Button>
    );
    expect(screen.getByRole("status")).toHaveTextContent("Guardada");
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();

    rerender(
      <Button status="error" onClick={onClick}>
        Guardar
      </Button>
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-phase", "error");
    expect(btn).not.toHaveAttribute("aria-disabled");
    expect(screen.getByRole("status")).toHaveTextContent("No se guardó · Reintentar");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("custom statusLabels replace the defaults", () => {
    render(
      <Button status="success" statusLabels={{ success: "Enviado" }}>
        Enviar
      </Button>
    );
    expect(screen.getByRole("status")).toHaveTextContent("Enviado");
  });

  it("reduced motion announces the same words and skips the choreography", () => {
    mockReducedMotion(true);
    const { rerender } = render(<Button status="idle">Guardar</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-reduced");
    rerender(<Button status="loading">Guardar</Button>);
    expect(btn).toHaveAttribute("data-phase", "loading"); // no 80 ms exit window
    expect(screen.getByRole("status")).toHaveTextContent("Guardando");
  });

  it("choreography: label exits 80 ms before the circle; spinner holds ≥ 350 ms", () => {
    mockReducedMotion(false);
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { rerender } = render(<Button status="idle">Guardar</Button>);
    const btn = screen.getByRole("button");

    rerender(<Button status="loading">Guardar</Button>);
    expect(btn).toHaveAttribute("data-phase", "exit");
    act(() => {
      vi.advanceTimersByTime(96);
    });
    expect(btn).toHaveAttribute("data-phase", "loading");

    // a fast save (100 ms) must not flicker: still loading until 350 ms on screen
    rerender(<Button status="success">Guardar</Button>);
    expect(btn).toHaveAttribute("data-phase", "loading");
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(btn).toHaveAttribute("data-phase", "loading");
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(btn).toHaveAttribute("data-phase", "success");
  });
});
