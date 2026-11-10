import { useEffect, useRef } from 'react';
import engineCss from './scrollcraft.css?raw';
import tokensCss from './landing-tokens.css?raw';
import engineUrl from './scrollcraft.js?url';

const STYLE_ID = 'mt-scrollcraft-style';
const SCRIPT_ID = 'mt-scrollcraft-script';
const FONT_ID = 'mt-scrollcraft-fonts';
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Outfit:wght@500;600;700&display=swap';

type ScrollCraftApi = {
  destroy: () => void;
  layout: () => void;
};

declare global {
  interface Window {
    ScrollCraft?: {
      mount: (root?: Element | string | null, opts?: object) => ScrollCraftApi;
      reduce: boolean;
      instances: ScrollCraftApi[];
    };
  }
}

function ensureEngineScript(): Promise<void> {
  if (window.ScrollCraft?.mount) return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.ScrollCraft?.mount) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('ScrollCraft script failed')), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = engineUrl;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('ScrollCraft script failed'));
    document.head.appendChild(script);
  });
}

export function useScrollCraftLanding(rootRef: React.RefObject<HTMLElement | null>) {
  const apiRef = useRef<ScrollCraftApi | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `${engineCss}\n${tokensCss}`;

    let fontEl = document.getElementById(FONT_ID) as HTMLLinkElement | null;
    if (!fontEl) {
      fontEl = document.createElement('link');
      fontEl.id = FONT_ID;
      fontEl.rel = 'stylesheet';
      fontEl.href = FONT_HREF;
      document.head.appendChild(fontEl);
    }

    const revealFallback = () => {
      root.querySelectorAll('[data-sc-in]').forEach((el) => el.classList.add('sc-in'));
      root.querySelectorAll('[data-sc-cue]').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
    };

    ensureEngineScript()
      .then(() => {
        if (cancelled || !rootRef.current || !window.ScrollCraft?.mount) {
          revealFallback();
          return;
        }
        apiRef.current?.destroy();
        apiRef.current = window.ScrollCraft.mount(rootRef.current);
      })
      .catch(() => {
        revealFallback();
      });

    return () => {
      cancelled = true;
      apiRef.current?.destroy();
      apiRef.current = null;
      document.getElementById(STYLE_ID)?.remove();
      document.getElementById(FONT_ID)?.remove();
      document.documentElement.classList.remove('sc-ready');
    };
  }, [rootRef]);
}
