import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '@/subdomains/app/layout/PublicLayout';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LandingFeatureSection from './LandingFeatureSection';
import LandingScreenMockup from './LandingScreenMockup';
import { landingFeatures } from './data';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  React.useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goRegister = () => navigate('oauth/register');

  const howSteps = [1, 2, 3] as const;
  const faqItems = [1, 2, 3, 4, 5] as const;
  const riskItems = [1, 2, 3] as const;

  return (
    <PublicLayout type="full">
      <div className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-background/75" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_2px,transparent_2px),linear-gradient(to_bottom,#80808008_2px,transparent_2px)] bg-[size:40px_40px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/12 rounded-full blur-[120px] opacity-50 -translate-y-1/2" />
        </div>

        <section id="hero" className="relative z-10 pt-24 pb-16 md:pt-32 md:pb-20 scroll-mt-20">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                {t('landing_v3.hero.badge')}
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6 text-foreground">
                {t('landing_v3.hero.title_line1')}{' '}
                <span className="text-primary">{t('landing_v3.hero.title_line2')}</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                {t('landing_v3.hero.description')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                  onClick={goRegister}
                >
                  {t('landing_v3.hero.cta_primary')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base font-semibold hover:scale-[1.02] transition-transform"
                  onClick={() => scrollToSection('como-funciona')}
                >
                  {t('landing_v3.hero.cta_demo')}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                {t('landing_v3.hero.trust_line')}
              </p>
            </motion.div>
          </div>
        </section>

        <section id="prova-visual" className="relative z-10 pb-16 md:pb-24 scroll-mt-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl mx-auto"
            >
              <p className="text-center text-sm font-medium text-muted-foreground mb-6">
                {t('landing_v3.visual.caption')}
              </p>
              <LandingScreenMockup screen="dashboard" />
            </motion.div>
          </div>
        </section>

        <section id="problema" className="relative z-10 py-20 md:py-28 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                {t('landing_v3.problem.title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('landing_v3.problem.p1')}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('landing_v3.problem.p2')}
              </p>
            </div>
          </div>
        </section>

        <section id="virada" className="relative z-10 py-20 md:py-28 bg-muted/40 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                {t('landing_v3.turn.title')}{' '}
                <span className="text-primary">{t('landing_v3.turn.title_accent')}</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('landing_v3.turn.p1')}
              </p>
              <p className="text-lg text-foreground/90 leading-relaxed font-medium">
                {t('landing_v3.turn.p2')}
              </p>
            </div>
          </div>
        </section>

        <section id="historia" className="relative z-10 py-20 md:py-28 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto rounded-3xl border border-border/60 bg-card/60 p-8 md:p-12 space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {t('landing_v3.story.label')}
              </p>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                {t('landing_v3.story.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing_v3.story.p1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing_v3.story.p2')}
              </p>
              <p className="text-foreground leading-relaxed font-medium">
                {t('landing_v3.story.p3')}
              </p>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="relative z-10 py-20 md:py-28 bg-muted/40 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 space-y-3">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                  {t('landing_v3.how.title')}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t('landing_v3.how.subtitle')}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {howSteps.map((step) => (
                  <div key={step} className="space-y-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {step}
                    </div>
                    <h3 className="text-xl font-semibold">
                      {t(`landing_v3.how.step${step}_title`)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(`landing_v3.how.step${step}_desc`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div id="produto">
          {landingFeatures.map((feature) => (
            <LandingFeatureSection
              key={feature.id}
              id={feature.id}
              featureKey={feature.featureKey}
              screen={feature.screen}
              reversed={feature.reversed}
            />
          ))}
        </div>

        <section id="risco-zero" className="relative z-10 py-20 md:py-28 bg-muted/40 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                {t('landing_v3.risk.title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('landing_v3.risk.subtitle')}
              </p>
              <ul className="grid sm:grid-cols-3 gap-4 text-left">
                {riskItems.map((n) => (
                  <li
                    key={n}
                    className="rounded-2xl border border-border/60 bg-background/80 p-5 text-sm font-medium leading-relaxed"
                  >
                    {t(`landing_v3.risk.item${n}`)}
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="rounded-full px-8 h-12 text-base font-semibold"
                onClick={goRegister}
              >
                {t('landing_v3.risk.cta')}
              </Button>
            </div>
          </div>
        </section>

        <section id="faq" className="relative z-10 py-20 md:py-28 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-10">
                {t('landing_v3.faq.title')}
              </h2>
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
          </div>
        </section>

        <section id="cta-final" className="relative z-10 py-28 md:py-32 scroll-mt-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                {t('landing_v3.cta.badge')}
              </p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                {t('landing_v3.cta.title')}{' '}
                <span className="text-primary">{t('landing_v3.cta.subtitle')}</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('landing_v3.cta.description')}
              </p>
              <Button
                size="lg"
                className="rounded-full px-12 h-14 text-lg font-bold"
                onClick={goRegister}
              >
                {t('landing_v3.cta.button')}
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default LandingPage;
