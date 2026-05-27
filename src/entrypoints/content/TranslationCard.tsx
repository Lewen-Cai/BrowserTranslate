import { useState, useEffect, useRef } from 'preact/hooks';
import { X, AlertCircle, Loader2 } from '~/ui/icons';
import { streamTranslate, abortTranslate } from '~/messaging/client';
import { computeIconPosition, ICON_SIZE } from './TriggerIcon';

interface Props {
  text: string;
  rect: DOMRect;
  onClose: () => void;
}

const CARD_WIDTH = 360;
let requestSeq = 0;

function friendlyError(raw: string): string {
  if (/context invalidated|extension context/i.test(raw)) {
    return 'Extension was updated. Please refresh this page to continue.';
  }
  return raw;
}

export function TranslationCard({ text, rect, onClose }: Props) {
  const [translated, setTranslated] = useState('');
  const [streaming, setStreaming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);   // drives open animation
  const currentReqId = useRef<string>('');

  useEffect(() => {
    // Trigger the open animation after first paint.
    const id = window.requestAnimationFrame(() => setVisible(true));
    void runInitial();
    return () => {
      window.cancelAnimationFrame(id);
      if (currentReqId.current) abortTranslate(currentReqId.current);
    };
  }, []); // intentionally run on mount only

  async function runInitial() {
    setTranslated('');
    setError(null);
    setStreaming(true);
    const reqId = `req-${Date.now()}-${++requestSeq}`;
    currentReqId.current = reqId;
    try {
      let full = '';
      for await (const msg of streamTranslate({
        type: 'translate',
        requestId: reqId,
        text,
        context: { url: location.href, title: document.title },
      })) {
        if (msg.type === 'translate:chunk') {
          full += msg.delta;
          setTranslated(full);
        } else if (msg.type === 'translate:error') {
          setError(friendlyError(msg.message));
          setStreaming(false);
          return;
        } else {
          setTranslated(msg.full);
          setStreaming(false);
        }
      }
    } catch (e) {
      setError(friendlyError((e as Error).message));
      setStreaming(false);
    }
  }

  // Position the card so its TOP-RIGHT corner is anchored to where the
  // icon was. Visually the card then drops down-and-left from the icon.
  const iconPos = computeIconPosition(rect);
  const iconRight = iconPos.left + ICON_SIZE;
  const iconBottom = iconPos.top + ICON_SIZE;

  const cardTop = iconBottom + 2;
  let cardLeft = iconRight - CARD_WIDTH;

  // Clamp horizontally
  const minLeft = window.scrollX + 4;
  const maxLeft = window.scrollX + window.innerWidth - CARD_WIDTH - 4;
  if (cardLeft < minLeft) cardLeft = minLeft;
  if (cardLeft > maxLeft) cardLeft = maxLeft;

  // If we'd extend below viewport bottom on a tall card, flip above
  // the selection instead — but only adjust top; final size unknown.
  // (Skip in v1 — most pages have enough scroll room.)

  return (
    <div
      style={{
        position: 'absolute',
        top: `${cardTop}px`,
        left: `${cardLeft}px`,
        width: `${CARD_WIDTH}px`,
        background: 'rgb(252 252 250)',
        border: '1px solid rgb(228 228 231)',
        boxShadow: '0 1px 0 rgb(0 0 0 / 0.04), 0 8px 24px -8px rgb(0 0 0 / 0.12)',
        fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif',
        fontSize: '13px',
        color: 'rgb(24 24 27)',
        overflow: 'hidden',
        borderRadius: '6px',
        transformOrigin: 'top right',
        transform: visible ? 'scale(1)' : 'scale(0.88)',
        opacity: visible ? 1 : 0,
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 140ms ease-out',
        willChange: 'transform, opacity',
      }}
    >
      {/* Header strip */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid rgb(228 228 231)' }}>
        <div style={{ width: '3px', background: '#2563EB' }} />
        <div style={{ flex: 1, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgb(113 113 122)' }}>TRANSLATION</span>
            <span style={{ fontSize: '11px', color: 'rgb(113 113 122)' }}>BrowserTranslate</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgb(113 113 122)', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={12} />
          </button>
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        {error ? (
          <div style={{ color: 'rgb(220 38 38)', display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '12px', lineHeight: 1.5 }}>
            <AlertCircle size={12} style={{ marginTop: 3, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55, minHeight: '1.55em', fontSize: '13px' }}>
            {translated || (streaming && (
              <span style={{ color: 'rgb(161 161 170)', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: '"Geist Mono", monospace', fontSize: '11px' }}>
                <Loader2 size={11} class="animate-spin" /> TRANSLATING
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
