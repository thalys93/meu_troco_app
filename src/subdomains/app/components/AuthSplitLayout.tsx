import React from 'react';
import {
  Coins,
  ArrowLeft,
  Ban,
  Shield,
  Users,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import bankIcon from '@/assets/brand/bank.png';

const notionIcon = '/icons8-notion.svg';
const sheetsIcon = '/icons8-google-sheets.svg';

const QUOTE_KEYS = ['q1', 'q2', 'q3'] as const;
type QuoteKey = (typeof QUOTE_KEYS)[number];

function IconBadge({
  children,
  badge,
  badgeClassName,
}: {
  children: React.ReactNode;
  badge: React.ReactNode;
  badgeClassName?: string;
}) {
  return (
    <div className="relative">
      {children}
      <div
        className={cn(
          'absolute -bottom-2 -right-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(24_20%_16%)] ring-4 ring-[hsl(36_38%_92%)] dark:bg-[hsl(20_30%_10%)] dark:ring-[hsl(20_30%_10%)]',
          badgeClassName
        )}
      >
        {badge}
      </div>
    </div>
  );
}

function QuoteIconCard({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl lg:h-32 lg:w-32',
        'bg-[radial-gradient(circle_at_30%_20%,#fffdf8_0%,#f5efe4_48%,#ebe2d4_100%)]',
        'shadow-2xl shadow-amber-950/10 ring-1 ring-amber-900/10',
        'dark:bg-[radial-gradient(circle_at_30%_25%,#d8f5e3_0%,#b7e4c7_45%,#95d5b2_100%)]',
        'dark:shadow-emerald-950/25 dark:ring-emerald-900/10',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.45),transparent_55%)]" />
      <img src={src} alt={alt} className="relative z-0 h-[72%] w-[72%] object-contain drop-shadow-md" draggable={false} />
    </div>
  );
}

function AppQuoteVisual({ quoteKey }: { quoteKey: QuoteKey }) {
  if (quoteKey === 'q1') {
    return (
      <IconBadge badge={<Ban className="h-7 w-7 text-red-400" strokeWidth={2.5} />}>
        <QuoteIconCard src={notionIcon} alt="Notion" />
      </IconBadge>
    );
  }

  if (quoteKey === 'q2') {
    return (
      <IconBadge badge={<Ban className="h-7 w-7 text-amber-400" strokeWidth={2.5} />}>
        <QuoteIconCard src={sheetsIcon} alt="Planilha" />
      </IconBadge>
    );
  }

  return (
    <IconBadge badge={<Ban className="h-7 w-7 text-sky-300" strokeWidth={2.5} />}>
      <QuoteIconCard src={bankIcon} alt="Banco" />
    </IconBadge>
  );
}

function BackofficeQuoteVisual({ quoteKey }: { quoteKey: QuoteKey }) {
  if (quoteKey === 'q1') {
    return (
      <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-black/30 lg:h-32 lg:w-32">
        <Shield className="h-14 w-14 lg:h-16 lg:w-16" strokeWidth={1.5} />
      </div>
    );
  }

  if (quoteKey === 'q2') {
    return (
      <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-sky-600 text-white shadow-2xl shadow-black/30 lg:h-32 lg:w-32">
        <Users className="h-14 w-14 lg:h-16 lg:w-16" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-violet-600 text-white shadow-2xl shadow-black/30 lg:h-32 lg:w-32">
      <LayoutDashboard className="h-14 w-14 lg:h-16 lg:w-16" strokeWidth={1.5} />
    </div>
  );
}

type AuthSplitLayoutProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'app' | 'backoffice';
  brandName?: string;
  BrandIcon?: LucideIcon;
  teamName?: string;
  teamDescription?: string;
  className?: string;
};

export function AuthSplitLayout({
  children,
  footer,
  variant = 'app',
  brandName,
  BrandIcon,
  teamName,
  teamDescription,
  className,
}: AuthSplitLayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [quoteIndex, setQuoteIndex] = React.useState(0);
  const activeQuote = QUOTE_KEYS[quoteIndex];
  const isBackoffice = variant === 'backoffice';
  const Icon = BrandIcon ?? (isBackoffice ? Shield : Coins);
  const resolvedBrandName = brandName ?? (isBackoffice ? t('backoffice.brand') : t('brand.name'));
  const resolvedTeamName = teamName ?? (isBackoffice ? t('backoffice.login.team') : t('login.team'));
  const resolvedTeamDescription =
    teamDescription ?? (isBackoffice ? t('backoffice.login.teamDescription') : t('login.appDescription'));
  const quotePrefix = isBackoffice ? 'backoffice.login.quotes' : 'login.quotes';

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % QUOTE_KEYS.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        'min-h-screen bg-[hsl(36_28%_96%)] p-3 dark:bg-background sm:p-5 lg:p-6',
        className
      )}
    >
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col gap-4 md:min-h-[calc(100vh-2.5rem)] md:flex-row md:gap-5 lg:gap-6">
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="relative hidden w-full overflow-hidden rounded-[1.75rem] border border-amber-900/5 bg-[hsl(36_38%_92%)] text-foreground md:flex md:w-[46%] md:flex-col lg:w-[48%] dark:border-transparent dark:bg-[hsl(20_30%_10%)] dark:text-white"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,hsl(28_70%_48%/0.14),transparent_42%),radial-gradient(circle_at_88%_78%,hsl(36_45%_78%/0.55),transparent_42%)] dark:bg-[radial-gradient(circle_at_20%_20%,hsl(28_70%_48%/0.28),transparent_45%),radial-gradient(circle_at_85%_75%,hsl(24_50%_30%/0.45),transparent_40%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] dark:opacity-[0.07]" />

          <div className="relative z-10 flex items-start justify-between p-8 lg:p-10">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="group flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 dark:shadow-black/20">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold tracking-tight">{resolvedBrandName}</span>
            </button>

            <div className="flex h-9 items-end gap-1" aria-hidden>
              <span className="h-7 w-1.5 rounded-sm bg-primary/90" />
              <span className="h-5 w-1.5 rounded-sm bg-amber-500/80" />
              <span className="h-3.5 w-1.5 rounded-sm bg-amber-700/70" />
            </div>
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${variant}-${activeQuote}`}
                initial={{ opacity: 0, scale: 0.88, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -8 }}
                transition={{ duration: 0.35 }}
                className="relative flex items-center justify-center"
              >
                <div className="absolute h-48 w-48 rounded-full bg-primary/10 blur-3xl lg:h-56 lg:w-56 dark:bg-primary/15" />
                {isBackoffice ? (
                  <BackofficeQuoteVisual quoteKey={activeQuote} />
                ) : (
                  <AppQuoteVisual quoteKey={activeQuote} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-10 px-8 pb-8 lg:px-12 lg:pb-10">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={`${variant}-${activeQuote}-text`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="max-w-lg"
              >
                <p className="text-lg font-medium leading-relaxed tracking-tight text-foreground/90 lg:text-xl dark:text-white/95">
                  “{t(`${quotePrefix}.${activeQuote}`)}”
                </p>
              </motion.blockquote>
            </AnimatePresence>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-900/10 bg-white/70 text-sm font-bold text-primary dark:border-white/15 dark:bg-white/10">
                MT
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground dark:text-white">{resolvedTeamName}</p>
                <p className="text-xs text-muted-foreground dark:text-white/55">{resolvedTeamDescription}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              {QUOTE_KEYS.map((key, index) => (
                <button
                  key={key}
                  type="button"
                  aria-label={`Quote ${index + 1}`}
                  onClick={() => setQuoteIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === quoteIndex
                      ? 'w-6 bg-primary'
                      : 'w-2 bg-amber-900/20 hover:bg-amber-900/35 dark:bg-white/25 dark:hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.aside>

        <section className="relative flex flex-1 flex-col overflow-y-auto">
          <div className="mb-3 flex items-center justify-end gap-2 md:sticky md:top-0 md:z-20 md:mb-0 md:bg-[hsl(36_28%_96%)]/80 md:py-1 md:backdrop-blur-sm dark:md:bg-background/80">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-foreground/80">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('navigation.back')}
            </Button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center py-4 md:py-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="w-full max-w-[440px] rounded-2xl border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(24,16,8,0.04),0_12px_40px_rgba(24,16,8,0.06)] sm:p-8 dark:border-border dark:shadow-none"
            >
              <div className="mb-6 flex items-center gap-2.5 md:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold tracking-tight">{resolvedBrandName}</span>
              </div>
              {children}
            </motion.div>

            {footer && (
              <p className="mt-6 max-w-sm px-4 text-center text-xs leading-relaxed text-muted-foreground">
                {footer}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthSplitLayout;
