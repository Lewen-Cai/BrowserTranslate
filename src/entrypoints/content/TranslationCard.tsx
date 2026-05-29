import { useState, useEffect, useRef } from 'preact/hooks';
import { X, AlertCircle, Loader2 } from '~/ui/icons';
import { streamTranslate, abortTranslate } from '~/messaging/client';
import { computeIconPosition, ICON_SIZE } from './TriggerIcon';
import { computeCardVerticalLayout } from './cardLayout';
import { looksLikeDictionary } from '~/core/dictionary/discriminate';
import { parseDictionaryEntry } from '~/core/dictionary/parse';
import { DictionaryView } from './DictionaryView';
import { t } from '~/i18n';
import type { Locale } from '~/i18n/strings';

interface Props {
  text: string;
  rect: DOMRect;
  locale: Locale;
  onClose: () => void;
}

const CARD_WIDTH = 360;
let requestSeq = 0;

function friendlyError(raw: string, locale: Locale): string {
  if (/context invalidated|extension context/i.test(raw)) {
    return t('cardRefreshNeeded', locale);
  }
  return raw;
}

export function TranslationCard({ text, rect, locale, onClose }: Props) {
  const [translated, setTranslated] = useState('');
  const [streaming, setStreaming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);   // drives open animation
  const currentReqId = useRef<string>('');
  const cancelled = useRef(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setVisible(true));
    void run();
    return () => {
      cancelled.current = true;
      window.cancelAnimationFrame(id);
      if (currentReqId.current) abortTranslate(currentReqId.current);
    };
  }, []); // mount only

  async function run() {
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
        if (cancelled.current) return;
        if (msg.type === 'translate:chunk') {
          full += msg.delta;
          setTranslated(full);
        } else if (msg.type === 'translate:error') {
          setError(friendlyError(msg.message, locale));
          setStreaming(false);
          return;
        } else {
          setTranslated(msg.full);
          setStreaming(false);
        }
      }
    } catch (e) {
      if (cancelled.current) return;
      setError(friendlyError((e as Error).message, locale));
      setStreaming(false);
    }
  }

  const iconPos = computeIconPosition(rect);
  const iconRight = iconPos.left + ICON_SIZE;
  let cardLeft = iconRight - CARD_WIDTH;
  const minLeft = window.scrollX + 4;
  const maxLeft = window.scrollX + window.innerWidth - CARD_WIDTH - 4;
  if (cardLeft < minLeft) cardLeft = minLeft;
  if (cardLeft > maxLeft) cardLeft = maxLeft;
  const { top: cardTop, maxHeight } = computeCardVerticalLayout(rect);

  // The model decides translate vs dictionary; we discriminate from the response.
  // A dictionary reply is a JSON object (starts with '{') — partial JSON can't be
  // rendered, so we show a neutral loading state until the stream completes, then
  // parse it (raw-text fallback on parse failure). Plain translations stream live.
  const isDict = looksLikeDictionary(translated);
  const dictEntry = isDict && !streaming && !error ? parseDictionaryEntry(translated) : null;

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
        ) : isDict && streaming ? (
          <span class="bt-card-loading">
            <Loader2 size={11} class="animate-spin" /> {t('loading', locale)}
          </span>
        ) : dictEntry ? (
          <DictionaryView entry={dictEntry} locale={locale} />
        ) : (
          <div class="bt-card-text">
            {translated || (streaming && (
              <span class="bt-card-loading">
                <Loader2 size={11} class="animate-spin" /> {t('loading', locale)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
