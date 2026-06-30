import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '@/subdomains/app/layout/PublicLayout';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LandingFeatureSection from './LandingFeatureSection';
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

  return (
    <PublicLayout type='full'>
      <div className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_2px,transparent_2px),linear-gradient(to_bottom,#80808008_2px,transparent_2px)] bg-[size:40px_40px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/15 rounded-full blur-[120px] opacity-40 -translate-y-1/2" />
          <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] opacity-30 px-4" />
        </div>

        <section id="hero" className="relative z-10 pt-24 pb-20 md:pt-32 md:pb-28 scroll-mt-20">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {t('landing_v3.hero.badge')}
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6 text-foreground">
                {t('landing_v3.hero.title_line1')}{' '}
                <span className="text-primary">{t('landing_v3.hero.title_line2')}</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                {t('landing_v3.hero.description')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                  onClick={() => navigate('oauth/register')}
                >
                  {t('landing_v3.hero.cta_primary')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base font-semibold hover:scale-[1.02] transition-transform"
                  onClick={() => scrollToSection('dashboard')}
                >
                  {t('landing_v3.hero.cta_demo')}
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex items-center justify-center gap-4"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-medium text-left max-w-xs">
                  {t('landing_v3.hero.social_proof')}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {landingFeatures.map((feature) => (
          <LandingFeatureSection
            key={feature.id}
            id={feature.id}
            featureKey={feature.featureKey}
            screen={feature.screen}
            reversed={feature.reversed}
          />
        ))}

        <section id="cta-final" className="relative z-10 py-32 dark:bg-zinc-950/80 backdrop-blur-lg text-white overflow-hidden scroll-mt-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="inline-block p-1 rounded-full bg-gradient-to-r from-primary to-amber-500 mb-8">
                <div className="px-4 py-1 rounded-full dark:bg-[#050505] bg-white text-xs font-bold uppercase tracking-widest text-primary">
                  {t('landing_v3.cta.badge')}
                </div>
              </div>
              <h2 className="text-4xl text-zinc-900 dark:text-white md:text-6xl font-bold mb-8">
                {t('landing_v3.cta.title')} <br />
                <span className="text-primary">{t('landing_v3.cta.subtitle')}</span>
              </h2>
              <p className="text-xl text-zinc-900 dark:text-white/60 max-w-2xl mx-auto mb-12">
                {t('landing_v3.cta.description')}
              </p>
              <Button
                size="lg"
                className="rounded-full px-12 h-14 text-lg font-bold"
                onClick={() => navigate('oauth/register')}
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
