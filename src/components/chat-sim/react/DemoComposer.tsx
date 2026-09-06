// react/DemoComposer.tsx — `mode="demo"`'s composer: VISUAL-ONLY, byte-for-byte the same markup
// as element/chat-sim-element.ts's `#buildComposer()` (same classes, same aria-hidden spans).
// Nothing is listening for input here — that's `mode="live"`'s LiveComposer. This is what
// T-007 acceptance #1's cross-DOM snapshot check compares against `<cf-chat-sim>` (today that
// check only diffs `.cf-log`/`.cf-head`, not `.cf-composer` — this file's own header commitment
// to byte-for-byte parity is what's binding here, not an automated gate).
//
// T-016/T-019: the composer icons were literal emoji ('😊', '➤') — same cross-machine-rendering
// problem T-016 fixed for receipt ticks (an emoji renders via the OS's own font, so two machines
// give two different pixel grids for the same chrome), and literal emoji here would also trip
// this task's acceptance #3 (zero emoji in react/**). Mirrors element/icons.ts's `emojiIcon`
// exactly ([skin]'s T-017, landed on the element/** side in the same cycle). No clip icon: this
// composer never had one (channel-agnostic, WhatsApp's simpler 2-icon layout) — not something
// this task adds.
function EmojiIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={9.5} />
      <path d="M8 14.5s1.6 2 4 2 4-2 4-2" />
      <circle cx={9} cy={9.5} r={0.9} fill="currentColor" stroke="none" />
      <circle cx={15} cy={9.5} r={0.9} fill="currentColor" stroke="none" />
    </svg>
  );
}

// Composer's trailing action — mirrors element/icons.ts's `micIcon` exactly. Always mic, never a
// send arrow: the input is a static placeholder ("Mensaje"), never real typed text, so the idle
// affordance both real apps show for an empty box is the mic (T-017 dispatch note, same reasoning
// applies here since this composer is equally static).
function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1.5a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0v-7a3 3 0 0 0-3-3z" />
      <path d="M19 10.5v1.5a7 7 0 0 1-14 0v-1.5" />
      <path d="M12 19v3" />
      <path d="M8.5 22h7" />
    </svg>
  );
}

export function DemoComposer() {
  return (
    <div className="cf-composer">
      <span className="cf-composer-icon" aria-hidden="true">
        <EmojiIcon />
      </span>
      <span className="cf-composer-input" aria-hidden="true">
        Mensaje
      </span>
      <span className="cf-composer-icon cf-composer-send" aria-hidden="true">
        <MicIcon />
      </span>
    </div>
  );
}
