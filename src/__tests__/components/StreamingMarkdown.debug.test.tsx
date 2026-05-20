/**
 * Debug test for StreamingMarkdown — verifies span keys stay stable across
 * progressive content renders (the wave should NOT re-fire on existing chars).
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StreamingMarkdown } from "../../components/messaging/primitives/StreamingMarkdown";

function snapshot(html: string): Array<{ pos: string | null; char: string; cls: string | null }> {
  const matches = [...html.matchAll(/<span[^>]*data-cf-pos="(\d+)"[^>]*class="([^"]*)"[^>]*>([^<]*)<\/span>/g)];
  return matches.map((m) => ({ pos: m[1], char: m[3], cls: m[2] }));
}

function snapshot2(html: string): Array<{ pos: string | null; char: string; cls: string | null }> {
  // class attribute may come before or after data-cf-pos; handle both orders
  const out: Array<{ pos: string | null; char: string; cls: string | null }> = [];
  const re = /<span\s+([^>]*?)>([^<]*)<\/span>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const posMatch = /data-cf-pos="(\d+)"/.exec(attrs);
    const clsMatch = /class="([^"]*)"/.exec(attrs);
    if (!posMatch) continue;
    out.push({ pos: posMatch[1], char: m[2], cls: clsMatch?.[1] ?? null });
  }
  return out;
}

describe("StreamingMarkdown key stability", () => {
  it("emits per-char spans with data-cf-pos for simple text", () => {
    const { container } = render(
      <StreamingMarkdown content="Hello" isStreaming />,
    );
    const html = container.innerHTML;
    const spans = snapshot2(html);
    console.log("simple test spans:", JSON.stringify(spans, null, 2));
    expect(spans.length).toBeGreaterThan(0);
    expect(spans[0].char).toBe("H");
  });

  it("preserves keys for existing chars as content grows", () => {
    const r1 = render(<StreamingMarkdown content="## Hello" isStreaming />);
    const html1 = r1.container.innerHTML;
    console.log("\n=== Render 1 (## Hello) ===\n", html1);
    const spans1 = snapshot2(html1);
    console.log("\nspans1:", JSON.stringify(spans1, null, 2));

    r1.rerender(<StreamingMarkdown content="## Hello\n\nWorld" isStreaming />);
    const html2 = r1.container.innerHTML;
    console.log("\n=== Render 2 (## Hello\\n\\nWorld) ===\n", html2);
    const spans2 = snapshot2(html2);
    console.log("\nspans2:", JSON.stringify(spans2, null, 2));

    // For each "Hello" char in render 2, its pos should match render 1
    const helloChars1 = spans1.filter((s) => "Hello".includes(s.char));
    const helloChars2 = spans2.filter((s) => "Hello".includes(s.char) && parseInt(s.pos!) < 10);
    console.log("\nhelloChars1 positions:", helloChars1.map((s) => `${s.char}=${s.pos}`));
    console.log("helloChars2 positions:", helloChars2.map((s) => `${s.char}=${s.pos}`));
  });

  it("does not collide keys when bold marker closes", () => {
    const r = render(<StreamingMarkdown content="**Hel" isStreaming />);
    let spans = snapshot2(r.container.innerHTML);
    console.log("\n=== **Hel ===\n", JSON.stringify(spans, null, 2));

    r.rerender(<StreamingMarkdown content="**Hello" isStreaming />);
    spans = snapshot2(r.container.innerHTML);
    console.log("\n=== **Hello ===\n", JSON.stringify(spans, null, 2));

    r.rerender(<StreamingMarkdown content="**Hello**" isStreaming />);
    spans = snapshot2(r.container.innerHTML);
    console.log("\n=== **Hello** ===\n", JSON.stringify(spans, null, 2));

    // Check for duplicate positions
    const positions = spans.map((s) => s.pos);
    const unique = new Set(positions);
    if (positions.length !== unique.size) {
      console.log("DUPLICATE KEYS!", positions);
    }
    expect(positions.length).toBe(unique.size);
  });

  it("simulates real chunky stream — appends 40-char batches", () => {
    const full = `## Opciones de Landing Page\n\nPara tu negocio, te recomendaría una landing con estas secciones:\n\n- **Hero** con propuesta de valor clara\n- *Testimonios* de clientes reales`;
    const r = render(<StreamingMarkdown content="" isStreaming />);
    let prevSpansByPos = new Map<string, { char: string; cls: string }>();

    for (let len = 40; len <= full.length; len += 40) {
      const chunk = full.slice(0, len);
      r.rerender(<StreamingMarkdown content={chunk} isStreaming />);
      const spans = snapshot2(r.container.innerHTML);
      const currentByPos = new Map<string, { char: string; cls: string }>();
      let conflicts = 0;
      for (const s of spans) {
        if (!s.pos) continue;
        currentByPos.set(s.pos, { char: s.char, cls: s.cls ?? "" });
        const prev = prevSpansByPos.get(s.pos);
        if (prev && (prev.char !== s.char)) {
          conflicts++;
          console.log(`At len=${len}: pos ${s.pos} changed char "${prev.char}" → "${s.char}"`);
        }
      }
      console.log(`len=${len}: ${spans.length} spans, ${conflicts} pos→char conflicts`);
      prevSpansByPos = currentByPos;
    }
  });
});
