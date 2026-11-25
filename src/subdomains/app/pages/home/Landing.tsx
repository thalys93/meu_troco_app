import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LinkedinLogo, ThreadsLogoIcon } from '@phosphor-icons/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import LegalModals from '@/shared/components/LegalModals';
import MarginReceipt from './MarginReceipt';
import { useScrollCraftLanding } from './useScrollCraftLanding';

const LANDING_STACK_MONTH_MQ = '(max-width: 900px)';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const rootRef = React.useRef<HTMLDivElement>(null);

  const stackMonth = React.useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(LANDING_STACK_MONTH_MQ);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(LANDING_STACK_MONTH_MQ).matches,
    () => false,
  );

  useScrollCraftLanding(rootRef, stackMonth);

  const [legalModal, setLegalModal] = React.useState<{
    isOpen: boolean;
    type: 'terms' | 'privacy';
  }>({ isOpen: false, type: 'terms' });

  React.useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const goRegister = () => navigate('oauth/register');

  const faqItems = [1, 2, 3, 4, 5] as const;
  const riskItems = [1, 2, 3] as const;
  const proofItems = ['lancar', 'painel', 'relatorios', 'previsoes'] as const;

  const monthChapter = (
    <div className={`mt-month${stackMonth ? ' mt-month--stack' : ''}`}>
      <div
        className="mt-month__copy"
        {...(stackMonth
          ? { 'data-sc-in': true }
          : { 'data-sc-cue': '0.06 0.94 0.35 0.12', 'data-sc-rise': '0' })}
      >
        <p className="sc-label">{t('landing_v3.story.label')}</p>
        <h2 className="sc-display sc-display--md" style={{ marginTop: 'var(--sc-4)' }}>
          {t('landing_v3.month.title')}
        </h2>
        <p className="sc-body" style={{ marginTop: 'var(--sc-4)' }}>
          {t('landing_v3.month.p1')}
        </p>
        <p className="sc-body" style={{ marginTop: 'var(--sc-3)', color: 'var(--sc-ink)' }}>
          {t('landing_v3.month.p2')}
        </p>
        <ul className="mt-month__proof">
          {proofItems.map((key) => (
            <li key={key}>
              <strong>{t(`landing_v3.month.proof_${key}`)}</strong>
              <span>{t(`landing_v3.month.proof_${key}_desc`)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`mt-month__scene${stackMonth ? ' mt-month__scene--compact' : ''}`}
        aria-hidden="true"
      >
        <div className="mt-layer mt-layer--back" data-sc-parallax={stackMonth ? undefined : '-1.2'} />
        <div className="mt-layer mt-layer--mid" data-sc-parallax={stackMonth ? undefined : '-0.55'}>
          <div className="mt-layer--mid-card">
            <div className="mt-line mt-line--short" />
            <div className="mt-rule" />
            <div className="mt-line mt-line--mid" />
            <div className="mt-line mt-line--accent" />
            <div className="mt-line mt-line--mid" />
            <div className="mt-line mt-line--short" />
            <div className="mt-rule" />
            <div className="mt-line mt-line--accent" />
          </div>
        </div>
        <div className="mt-layer mt-layer--mark" data-sc-parallax={stackMonth ? undefined : '-0.2'}>
          <img src="/new_rebrand/nobg.png" alt="" width={160} height={160} />
        </div>
        <div className="mt-layer mt-layer--front" data-sc-parallax={stackMonth ? undefined : '0.45'} />
        <div className="mt-month__fade" />
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className="mt-landing">
      <span data-sc-progress aria-hidden="true" />

      <div className="mt-folio">
        <a href="#hero" className="mt-folio__mark">
          <img src="/new_rebrand/nobg.png" alt="" width={28} height={28} />
          <span>{t('brand.name')}</span>
        </a>
        <div className="mt-folio__lang">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      <MarginReceipt />

      {/* 1 · Rosto — flow */}
      <section
        id="hero"
        className="mt-ground--paper"
        data-sc-act="flow"
        data-sc-span="1.2"
      >
        <div className="mt-title">
          <div className="mt-title__inner sc-stack" data-sc-in data-sc-stagger="60">
            <h1 className="sc-display sc-display--xl">
              {t('landing_v3.hero.title_line1')}{' '}
              <span style={{ color: 'var(--sc-accent)' }}>{t('landing_v3.hero.title_line2')}</span>
            </h1>
            <p className="sc-lede mt-title__lede">{t('landing_v3.hero.description')}</p>
            <button type="button" className="mt-title__cta" onClick={goRegister}>
              {t('landing_v3.hero.cta_primary')}
            </button>
            <p className="mt-title__trust">{t('landing_v3.hero.trust_line')}</p>
          </div>
        </div>
      </section>

      {/* 2 · Problema — reveal */}
      <section
        id="problema"
        className="mt-ground--cold"
        data-sc-act="pin"
        data-sc-span="1.8"
      >
        <div data-sc-stage>
          <div className="mt-problem" data-sc-reveal="left" data-sc-reveal-at="0.08 0.55">
            <div className="sc-stack">
              <h2 className="sc-display sc-display--md">{t('landing_v3.problem.title')}</h2>
              <p className="sc-body">{t('landing_v3.problem.p1')}</p>
              <p className="sc-body">{t('landing_v3.problem.p2')}</p>
              <p className="sc-body" style={{ color: 'var(--sc-ink)' }}>
                {t('landing_v3.hero.description')}
              </p>
            </div>
            <figure className="mt-problem__plate" aria-hidden="true">
              <div className="mt-problem__plate-sheet" />
            </figure>
          </div>
        </div>
      </section>

      {/* 3 · Virada — kinetic (held briefly so lines assemble) */}
      <section
        id="virada"
        className="mt-ground--turn"
        data-sc-act="pin"
        data-sc-span="2.8"
        data-sc-dwell="0.46"
      >
        <div data-sc-stage className="mt-turn">
          <div>
            <h2
              className="sc-display sc-display--lg"
              data-sc-cue="0.04 0.98 0.16 0.04"
              data-sc-kinetic="lines"
            >
              {t('landing_v3.turn.title')}{' '}
              <span className="sc-accent-line">{t('landing_v3.turn.title_accent')}</span>
            </h2>
            <div className="mt-turn__body" data-sc-cue="0.22 0.98 0.2 0.04">
              <p className="sc-body">{t('landing_v3.turn.p1')}</p>
              <p className="sc-body">{t('landing_v3.turn.p2')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 · Mês — pin + parallax no desktop; flow legível no mobile */}
      <section
        id="produto"
        className={`mt-ground--month${stackMonth ? ' sc-section' : ''}`}
        data-sc-act={stackMonth ? 'flow' : 'pin'}
        {...(!stackMonth ? { 'data-sc-span': '1.8' } : {})}
      >
        {stackMonth ? monthChapter : <div data-sc-stage>{monthChapter}</div>}
      </section>

      {/* 5 · Fecho — in */}
      <section id="faq" className="mt-ground--close sc-section" data-sc-act="flow">
        <div className="mt-close" data-sc-in data-sc-stagger="70">
          <p className="sc-label">{t('landing_v3.cta.badge')}</p>
          <h2 className="sc-display sc-display--md" style={{ marginTop: 'var(--sc-4)' }}>
            {t('landing_v3.cta.title')} {t('landing_v3.cta.subtitle')}
          </h2>
          <p className="sc-body" style={{ marginTop: 'var(--sc-4)' }}>
            {t('landing_v3.cta.description')}
          </p>

          <ul className="mt-close__risk">
            {riskItems.map((n) => (
              <li key={n}>{t(`landing_v3.risk.item${n}`)}</li>
            ))}
          </ul>

          <p className="sc-lede">
            {t('landing_v3.close.lead')}{' '}
            <button type="button" className="mt-close__cta" onClick={goRegister}>
              {t('landing_v3.cta.button')}
            </button>
            .
          </p>

          <div className="mt-close__faq">
            <h3>{t('landing_v3.faq.title')}</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((n) => (
                <AccordionItem key={n} value={`faq-${n}`}>
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {t(`landing_v3.faq.q${n}`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {t(`landing_v3.faq.a${n}`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-close__meta">
            <button
              type="button"
              onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}
            >
              {t('footer.privacy_policy')}
            </button>
            <button
              type="button"
              onClick={() => setLegalModal({ isOpen: true, type: 'terms' })}
            >
              {t('footer.terms_of_use')}
            </button>
            <a
              href="https://www.linkedin.com/in/thalys-dev202/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <LinkedinLogo className="w-4 h-4 inline" />
            </a>
            <a
              href="https://www.threads.com/@thalys_xavierr"
              target="_blank"
              rel="noreferrer"
              aria-label="Threads"
            >
              <ThreadsLogoIcon className="w-4 h-4 inline" />
            </a>
            <a href="/oauth/login">{t('navigation.signIn')}</a>
            <a href="/backoffice/login" aria-label={t('footer.backoffice_access')}>
              © {new Date().getFullYear()} {t('brand.full')}
            </a>
          </div>
        </div>
      </section>

      <LegalModals
        isOpen={legalModal.isOpen}
        onOpenChange={(open) => setLegalModal((prev) => ({ ...prev, isOpen: open }))}
        type={legalModal.type}
      />
    </div>
  );
};

export default LandingPage;
