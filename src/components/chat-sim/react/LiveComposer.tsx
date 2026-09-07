// react/LiveComposer.tsx — `mode="live"`'s REAL, operable composer (element/chat-sim-element.ts's
// own docstring: "a real, operable composer with mobile keyboard handling is react/'s T-007").
//
// Styling is inline (`style={{}}`), not new classes in styles.css: `styles.css` is [skin]'s sole
// write cell (file-ownership-matrix.md) and `app` only has `A` (ask) on it — asking for four
// bespoke mobile rules for a component skin never renders is a bigger cross-lane dependency than
// this warrants. Inline styles also can't trip the chat-sim Tailwind-ban scan (it only matches
// `class`/`className`/`classList.add` tokens), so this stays a clean, self-contained `app`-owned
// file. Shared visual language still comes from the `--cf-cs-*` custom properties styles.css
// already defines at `.cf-chat-sim` — referenced here via `var(...)`, never redeclared.
//
// MOBILE-CHECKLIST.md (T-007 acceptance #3) is the row-by-row account of which of
// MobileComposer.tsx's OWN declared reasons this covers and which it deliberately doesn't
// (voice notes, an AI-busy/stop state, `allowEmptySend` vocabulary parity — none apply to a
// demo/live chat SIMULATOR composer).

import { useCallback, useRef, useState, type ChangeEvent, type CSSProperties, type RefObject } from 'react';
import { useKeyboardInset } from './useKeyboardInset';

const MAX_HEIGHT = 120; // same cap MobileComposer.tsx uses (auto-grow, then scroll internally)
const TAP_TARGET = 44; // architecture-v1.md §8: tap targets >= 44px

// T-019: was a literal '➤' character — an emoji/dingbat renders via the OS's own font, the same
// cross-machine-rendering problem T-016 fixed for receipt ticks (capture/'s byte-identical-PNG
// guarantee only ever held on the one machine it ran on), and it would also trip this task's
// acceptance #3 (zero emoji in react/**). Self-contained: unlike DemoComposer's icons, this button
// has no element/** counterpart to mirror (this file's own header — LiveComposer is `mode="live"`'s
// real, operable composer, react-only, T-007) so there's no cross-check shape to match.
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M3 11.5 20 4l-6.5 17-2.8-7.2L3 11.5z" />
    </svg>
  );
}

export interface LiveComposerProps {
  readonly placeholder: string;
  readonly onSend: (text: string) => void;
  /** The `<ol class="cf-log">` node — scrolled to bottom whenever the keyboard inset changes, so
   * the last message stays visible (T-007 acceptance #2's second half) instead of sliding under
   * the keyboard while the flex layout catches up. */
  readonly logRef?: RefObject<HTMLElement | null>;
}

const barStyle = (kbInset: number): CSSProperties => ({
  display: 'flex',
  alignItems: 'flex-end',
  gap: '0.5rem',
  flex: 'none',
  padding: '0.5rem 0.7rem',
  paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${kbInset}px + 0.5rem)`,
  background: 'var(--cf-cs-card, #fff)',
  borderTop: '1px solid var(--cf-cs-hairline, rgba(0,0,0,0.08))',
});

const inputStyle: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  resize: 'none',
  border: 'none',
  outline: 'none',
  fontSize: 16, // architecture-v1.md §8: input font-size >= 16px (prevents iOS auto-zoom-on-focus)
  lineHeight: 1.35,
  fontFamily: 'var(--cf-cs-sans, inherit)',
  color: 'var(--cf-cs-ink, inherit)',
  background: 'var(--cf-cs-surface, #e9edef)',
  borderRadius: 999,
  padding: '0.6rem 0.9rem',
  maxHeight: MAX_HEIGHT,
};

const sendStyle = (canSend: boolean): CSSProperties => ({
  flex: 'none',
  width: TAP_TARGET,
  height: TAP_TARGET,
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  border: 'none',
  background: 'var(--cf-cs-accent, #25d366)',
  color: 'var(--cf-cs-accent-ink, #fff)',
  opacity: canSend ? 1 : 0.4,
  cursor: canSend ? 'pointer' : 'default',
});

export function LiveComposer({ placeholder, onSend, logRef }: LiveComposerProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollLogToBottom = useCallback((): void => {
    const log = logRef?.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [logRef]);

  const kbInset = useKeyboardInset(scrollLogToBottom);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const el = e.target;
    setText(el.value);
    // Auto-grow to fit content, capped — same technique MobileComposer.tsx uses for a recovered
    // multi-line draft (MOBILE-CHECKLIST.md row "borrador auto-grow").
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  const handleSend = (): void => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    scrollLogToBottom();
  };

  const canSend = text.trim().length > 0;

  return (
    <div className="cf-live-composer" data-kb-inset={kbInset} style={barStyle(kbInset)}>
      <textarea
        ref={textareaRef}
        className="cf-live-input"
        value={text}
        onChange={handleInput}
        placeholder={placeholder}
        aria-label={placeholder}
        rows={1}
        // No onKeyDown handler at all: touch keyboards don't differentiate a Shift-modified
        // Enter, so — same call MobileComposer.tsx makes — Enter is always a newline, and
        // sending is ONLY ever the button below.
        style={inputStyle}
      />
      <button
        type="button"
        className="cf-live-send"
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Enviar"
        style={sendStyle(canSend)}
      >
        <SendIcon />
      </button>
    </div>
  );
}
