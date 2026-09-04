// react/DemoComposer.tsx — `mode="demo"`'s composer: VISUAL-ONLY, byte-for-byte the same markup
// as element/chat-sim-element.ts's `#buildComposer()` (same classes, same aria-hidden spans,
// same glyphs). Nothing is listening for input here — that's `mode="live"`'s LiveComposer. This
// is what T-007 acceptance #1's cross-DOM snapshot check compares against `<cf-chat-sim>`.

export function DemoComposer() {
  return (
    <div className="cf-composer">
      <span className="cf-composer-icon" aria-hidden="true">
        😊
      </span>
      <span className="cf-composer-input" aria-hidden="true">
        Mensaje
      </span>
      <span className="cf-composer-icon cf-composer-send" aria-hidden="true">
        ➤
      </span>
    </div>
  );
}
