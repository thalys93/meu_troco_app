import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Smartphone,
  Monitor,
  Loader2,
} from 'lucide-react';
import { RoadmapVerticalTimeline } from '@/components/roadmap/RoadmapVerticalTimeline';
import { useGetPublicRoadmap } from '@/utils/services/api/roadmap-service';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '@/subdomains/app/layout/PublicLayout';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion'
import MockupDashboard from './MockupDashboard';
import { useIsMobile } from '../../../../hooks/use-mobile';
import { mockSecurityItems } from './data';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [mockupTab, setMockupTab] = React.useState<'dashboard' | 'transactions'>('dashboard');
  const [mockupDevice, setMockupDevice] = React.useState<'desktop' | 'mobile'>('desktop');
  const isMobile = useIsMobile();
  const { data: roadmapTree, isLoading: roadmapLoading } = useGetPublicRoadmap(i18n.language);

  React.useEffect(() => {
    if (isMobile) setMockupDevice('mobile');
  }, [isMobile]);


  return (
    <PublicLayout type='full'>
      <div className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_2px,transparent_2px),linear-gradient(to_bottom,#80808008_2px,transparent_2px)] bg-[size:40px_40px]" />

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-40 -translate-y-1/2" />
          <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] opacity-30 px-4" />
          <div className="absolute top-[40%] right-[0%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-20" />
          <div className="absolute top-[75%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] opacity-20" />
        </div>

        <section id="hero" className="relative z-10 pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <span>{t('landing_v2.hero.new')}</span>
                <span className="w-1 h-1 rounded-full bg-primary/40" />
                <span>{t('landing_v2.hero.ai_feature')}</span>
              </div>

              <h1 className="text-5xl md:text-[80px] font-bold tracking-tight leading-[1.1] mb-8 text-foreground drop-shadow-sm">
                {t('landing_v2.hero.title_white')} <br />
                <span className="text-primary">{t('landing_v2.hero.title_gray')}</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                {t('landing_v2.hero.description')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-12 text-base font-semibold transition-all hover:scale-105"
                  onClick={() => navigate('oauth/login')}
                >
                  {t('buttons.start_now')}
                </Button>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                      +10k
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {t('landing_v2.hero.social_proof')}
                  </span>
                </div>
              </div>

              {!isMobile && (
                <div className="flex justify-center mb-8 gap-1 p-1 bg-muted/30 backdrop-blur-sm rounded-full w-fit mx-auto border border-border/50">
                  <button
                    onClick={() => setMockupDevice('desktop')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${mockupDevice === 'desktop' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    onClick={() => setMockupDevice('mobile')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${mockupDevice === 'mobile' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className={`relative mx-auto transition-all duration-500 ease-in-out ${mockupDevice === 'desktop' ? 'max-w-5xl w-full' : 'max-w-[320px]'}`}
              >
                <MockupDashboard
                  device={mockupDevice}
                  tab={mockupTab}
                  onTabChange={setMockupTab}
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="roadmap" className="relative z-10 py-24 container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {t('landing_v2.roadmap.title')}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t('landing_v2.roadmap.description')}
              </p>
            </div>

            {roadmapLoading && (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!roadmapLoading && roadmapTree && (
              <RoadmapVerticalTimeline
                tree={roadmapTree}
                variant="public"
                showPreviewBanner={false}
                className="border border-border/60 shadow-lg"
              />
            )}
          </div>
        </section>

        <section id="beneficios" className="relative z-10 py-24 bg-card/40 backdrop-blur-md border-y border-border overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                {t('landing_v2.security.title')} <br />
                <span className="text-primary">{t('landing_v2.security.subtitle')}</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {mockSecurityItems.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="p-8 rounded-3xl border border-border bg-background hover:bg-muted/50 transition-colors group">
                    <Icon className="w-10 h-10 text-primary mb-6 transition-transform group-hover:scale-110" />
                    <h3 className="text-xl font-bold mb-4">{t(s.titleKey)}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t(s.descKey)}</p>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </section>

        <section className="relative z-10 py-32 dark:bg-zinc-950/80 backdrop-blur-lg text-white overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="inline-block p-1 rounded-full bg-gradient-to-r from-primary to-emerald-400 mb-8">
                <div className="px-4 py-1 rounded-full dark:bg-[#050505] bg-white text-xs font-bold uppercase tracking-widest text-primary">
                  {t('landing_v2.ai.one_more_thing')}
                </div>
              </div>
              <h2 className="text-4xl text-zinc-900 dark:text-white md:text-6xl font-bold mb-8">
                {t('landing_v2.cta.title')} <br />
                <span className="text-primary">{t('landing_v2.cta.subtitle')}</span>
              </h2>
              <p className="text-xl text-zinc-900 dark:text-white/60 max-w-2xl mx-auto mb-12">
                {t('landing_v2.ai.description')}
              </p>
              <Button
                size="lg"
                className="rounded-full px-12 h-14 text-lg font-bold"
                onClick={() => navigate('oauth/login')}
              >
                {t('landing_v2.cta.button')}
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default LandingPage;
