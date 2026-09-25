import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  SPRINGS,
  springAt,
  springOvershoot,
  springSettleTime,
  springToCSSLinear,
  springTrack,
  springTransition,
} from "../../lib/spring";

describe("springAt", () => {
  it.each([
    ["underdamped", { duration: 0.4, bounce: 0.3 }],
    ["critical", { duration: 0.4, bounce: 0 }],
    ["overdamped", { duration: 0.4, bounce: -0.4 }],
  ])("%s starts at 0 at rest and settles at 1", (_, p) => {
    expect(springAt(0, p)).toBe(0);
    expect(springAt(-1, p)).toBe(0);
    // velocity ≈ 0 at t=0 (starts at rest)
    expect(springAt(1e-4, p) / 1e-4).toBeLessThan(0.5);
    expect(springAt(5, p)).toBeCloseTo(1, 4);
  });

  it("honours initial velocity", () => {
    const p = { duration: 0.4, bounce: 0, velocity: 8 };
    const dt = 1e-5;
    expect(springAt(dt, p) / dt).toBeCloseTo(8, 1);
  });

  it("is continuous across the critical boundary", () => {
    const a = springAt(0.2, { duration: 0.4, bounce: 1e-4 });
    const b = springAt(0.2, { duration: 0.4, bounce: 0 });
    const c = springAt(0.2, { duration: 0.4, bounce: -1e-4 });
    expect(a).toBeCloseTo(b, 3);
    expect(c).toBeCloseTo(b, 3);
  });
});

describe("presets honour the taste contract", () => {
  it.each(Object.entries(SPRINGS))("%s overshoots at most 2 %", (_, p) => {
    expect(springOvershoot(p)).toBeLessThanOrEqual(0.02);
  });

  it("bounce 0 never overshoots", () => {
    expect(springOvershoot({ duration: 0.5, bounce: 0 })).toBeLessThan(1e-9);
  });

  it("settle time grows with duration", () => {
    expect(springSettleTime(SPRINGS.snappy)).toBeLessThan(springSettleTime(SPRINGS.smooth));
    expect(springSettleTime(SPRINGS.smooth)).toBeLessThan(springSettleTime(SPRINGS.gentle));
  });
});

describe("springToCSSLinear", () => {
  it("produces a valid linear() that starts at 0 and ends at 1", () => {
    const { easing, duration } = springToCSSLinear(SPRINGS.smooth, 20);
    const stops = easing.slice("linear(".length, -1).split(", ").map(Number);
    expect(stops).toHaveLength(21);
    expect(stops[0]).toBe(0);
    expect(stops.at(-1)).toBe(1);
    expect(duration).toBeGreaterThan(0.3);
    expect(duration).toBeLessThan(1);
  });
});

describe("springTrack", () => {
  it("retargeting mid-flight is continuous and lands on the last target", () => {
    const changes = [
      { at: 0, to: 100 },
      { at: 0.15, to: 20 },
    ];
    const before = springTrack(0.15 - 1e-6, changes);
    const after = springTrack(0.15 + 1e-6, changes);
    expect(Math.abs(after - before)).toBeLessThan(0.01);
    expect(springTrack(5, changes)).toBeCloseTo(20, 3);
  });
});

describe("springTransition", () => {
  it("maps presets to framer-motion spring options", () => {
    expect(springTransition("snappy")).toEqual({
      type: "spring",
      visualDuration: SPRINGS.snappy.duration,
      bounce: SPRINGS.snappy.bounce,
    });
  });
});

describe("CSS tokens", () => {
  it("styles/index.css carries every preset (run npm run gen:springs if this fails)", () => {
    const css = readFileSync(resolve(__dirname, "../../styles/index.css"), "utf8");
    for (const [name, p] of Object.entries(SPRINGS)) {
      const { easing, duration } = springToCSSLinear(p);
      expect(css).toContain(`--cf-spring-${name}: ${easing};`);
      expect(css).toContain(`--cf-spring-${name}-duration: ${Math.round(duration * 1000)}ms;`);
    }
  });
});
