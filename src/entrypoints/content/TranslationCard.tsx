import { useState, useEffect, useRef } from 'preact/hooks';
import { X, AlertCircle, Loader2 } from '~/ui/icons';
import { streamTranslate, abortTranslate } from '~/messaging/client';
import { computeIconPosition, ICON_SIZE } from './TriggerIcon';
import { computeCardVerticalLayout } from './cardLayout';
import { classifySelection, type LookupMode } from '~/core/dictionary/classify';

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
  const [mode, setMode] = useState<LookupMode>(() => classifySelection(text));

  useEffect(() => {
    // Trigger the open animation after first paint.
    const id = window.requestAnimationFrame(() => setVisible(true));
    void run(mode);
    return () => {
      window.cancelAnimationFrame(id);
      if (currentReqId.current) abortTranslate(currentReqId.current);
    };
  }, []); // intentionally run on mount only

  function switchMode(next: LookupMode) {
    if (next === mode) return;
    if (currentReqId.current) abortTranslate(currentReqId.current);
    setMode(next);
    void run(next);
  }

  async function run(activeMode: LookupMode) {
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
        mode: activeMode,
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
  let cardLeft = iconRight - CARD_WIDTH;

  // Clamp horizontally
  const minLeft = window.scrollX + 4;
  const maxLeft = window.scrollX + window.innerWidth - CARD_WIDTH - 4;
  if (cardLeft < minLeft) cardLeft = minLeft;
  if (cardLeft > maxLeft) cardLeft = maxLeft;

  // Vertical placement keeps the card inside the viewport and caps its height
  // so a long translation scrolls inside the card (see cardLayout.ts).
  const { top: cardTop, maxHeight } = computeCardVerticalLayout(rect);

  return (
    <div
      class="bt-card"
      style={{
        position: 'absolute',
        top: `${cardTop}px`,
        left: `${cardLeft}px`,
        width: `${CARD_WIDTH}px`,
        maxHeight: `${maxHeight}px`,
        transformOrigin: 'top right',
        transform: visible ? 'scale(1)' : 'scale(0.88)',
        opacity: visible ? 1 : 0,
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 140ms ease-out',
        willChange: 'transform, opacity',
      }}
    >
      <div class="bt-card-header">
        <div class="bt-card-strip" />
        <div class="bt-card-header-content">
          <div class="bt-card-title-row">
            <div class="bt-card-modes">
              <button
                class={mode === 'translate' ? 'bt-card-mode-btn bt-card-mode-active' : 'bt-card-mode-btn'}
                onClick={() => switchMode('translate')}
              >
                Translate
              </button>
              <button
                class={mode === 'dictionary' ? 'bt-card-mode-btn bt-card-mode-active' : 'bt-card-mode-btn'}
                onClick={() => switchMode('dictionary')}
              >
                Define
              </button>
            </div>
            <span class="bt-card-brand-mark">BrowserTranslate</span>
          </div>
          <button onClick={onClose} class="bt-card-close" aria-label="Close">
            <X size={12} />
          </button>
        </div>
      </div>
      <div class="bt-card-body">
        {error ? (
          <div class="bt-card-error">
            <AlertCircle size={12} class="bt-card-error-icon" />
            <span>{error}</span>
          </div>
        ) : (
          <div class="bt-card-text">
            {translated || (streaming && (
              <span class="bt-card-loading">
                <Loader2 size={11} class="animate-spin" /> TRANSLATING
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
