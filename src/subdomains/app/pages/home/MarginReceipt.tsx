import React from 'react';
import { useTranslation } from 'react-i18next';

export type ReceiptChapterId = 'hero' | 'problema' | 'virada' | 'produto' | 'faq';

const CHAPTERS: ReceiptChapterId[] = ['hero', 'problema', 'virada', 'produto', 'faq'];

function MarginReceipt() {
  const { t } = useTranslation();
  const [stamped, setStamped] = React.useState<Record<string, boolean>>({
    hero: true,
  });
  const [active, setActive] = React.useState<ReceiptChapterId>('hero');
  const [monthOpen, setMonthOpen] = React.useState(false);

  React.useEffect(() => {
    const nodes = CHAPTERS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!nodes.length) return;

    const mark = (id: ReceiptChapterId) => {
      const idx = CHAPTERS.indexOf(id);
      setStamped((prev) => {
        const next = { ...prev };
        for (let i = 0; i <= idx; i += 1) next[CHAPTERS[i]] = true;
        return next;
      });
      setActive(id);
      if (id === 'produto' || id === 'faq') setMonthOpen(true);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        visible.forEach((entry) => {
          const id = entry.target.id as ReceiptChapterId;
          if (CHAPTERS.includes(id)) mark(id);
        });
      },
      { root: null, threshold: [0.15, 0.35, 0.55], rootMargin: '-8% 0px -28% 0px' }
    );

    nodes.forEach((n) => observer.observe(n));

    const onScroll = () => {
      const mid = window.innerHeight * 0.42;
      let current: ReceiptChapterId = 'hero';
      for (const id of CHAPTERS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom >= mid * 0.45) current = id;
      }
      mark(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const go = (id: ReceiptChapterId) => {
    if (!stamped[id]) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const valueFor = (id: ReceiptChapterId) => {
    if (id === 'produto' && monthOpen && stamped[id]) {
      return t('landing_v3.receipt.value_month');
    }
    if (id === 'faq' && stamped[id]) {
      return t('landing_v3.receipt.value_close');
    }
    return '·';
  };

  return (
    <aside className="mt-receipt" aria-label={t('landing_v3.receipt.aria')}>
      <div className="mt-receipt__head">
        <span>{t('landing_v3.receipt.title')}</span>
        <span>{t('landing_v3.receipt.unit')}</span>
      </div>
      <ul className="mt-receipt__list">
        {CHAPTERS.map((id) => {
          const isStamped = Boolean(stamped[id]);
          const open = (id === 'produto' && monthOpen && isStamped) || (id === 'faq' && isStamped);

          return (
            <li key={id}>
              <button
                type="button"
                className="mt-receipt__row"
                data-stamped={isStamped}
                data-active={active === id}
                data-open={open}
                onClick={() => go(id)}
                aria-current={active === id ? 'true' : undefined}
              >
                <span>{t(`landing_v3.receipt.line_${id}`)}</span>
                <span className="mt-receipt__value">{valueFor(id)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default MarginReceipt;
