import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  TrendingUp,
  Smartphone,
  Shield,
  Zap,
  Wallet,
  BarChart3,
  Calendar,
  Target,
  Monitor,
  Home,
  TrendingDown,
  User,
  MoreHorizontal,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '@/subdomains/app/layout/PublicLayout';
import { useTranslation } from 'react-i18next';
import { useGetPlans } from '@/utils/api/plans';
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes';
import MockupDashboard from './MockupDashboard';
import financeIMG from '@/assets/finances_bg.jpg';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mockupTab, setMockupTab] = React.useState<'dashboard' | 'transactions'>('dashboard');
  const [mockupDevice, setMockupDevice] = React.useState<'desktop' | 'mobile'>('desktop');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data: plans } = useGetPlans();

  const handlePricingClick = (planTitle: string) => {
    navigate('oauth/register', { state: { plan: planTitle } });
  };

  return (
    <PublicLayout type='full'>
      <div className="relative overflow-hidden bg-background">
        {/* Modern SaaS Grid Background - Extended */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Main Grid Mesh - Whole Page */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_2px,transparent_2px),linear-gradient(to_bottom,#80808008_2px,transparent_2px)] bg-[size:40px_40px]" />

          {/* Accent Glows - Distributed along the page */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-40 -translate-y-1/2" />
          <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] opacity-30 px-4" />
          <div className="absolute top-[40%] right-[0%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-20" />
          <div className="absolute top-[75%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] opacity-20" />
        </div>

        {/* Hero Section */}
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

              {/* Device Toggle */}
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

              {/* Central Mockup */}
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

        {/* Add Anything, See Anything Section */}
        <section className="relative z-10 py-24 container mx-auto px-4">
          <div className="text-center mb-16 px-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('landing_v2.connect.title')} <br />
              <span className="text-primary">{t('landing_v2.connect.subtitle')}</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('landing_v2.connect.description')}
            </p>
          </div>

          <div className="max-w-xl mx-auto mb-16">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-semibold text-lg">{t('landing_v2.connect.card_title')}</h3>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Nubank', logo: 'https://logodownload.org/wp-content/uploads/2019/08/nubank-logo-2.png' },
                  { name: 'Inter', logo: 'https://raichu-uploads.s3.amazonaws.com/logo_inter_XNlYcp.png' },
                  { name: 'Itaú', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBVX5cePnQ8Ro6l7hbukhRyGJmzmRDLyFKug&s' },
                  { name: 'XP Investimentos', logo: 'https://uploads.spacemoney.com.br/2024/04/xp-investimentos.jpg' }
                ].map((bank) => (
                  <div key={bank.name} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border overflow-hidden flex items-center justify-center">
                        <img src={bank.logo} alt={bank.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium">{bank.name}</span>
                    </div>
                    <div className="text-sm text-primary">{t('landing_v2.connect.connected')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Transactions Section */}
        <section className="relative z-10 py-24 bg-muted/20 backdrop-blur-[2px]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {t('landing_v2.transactions.title')} <br />
                <span className="text-primary">{t('landing_v2.transactions.subtitle')}</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                {[
                  { id: 'Income', label: t('landing_v2.transactions.income') },
                  { id: 'Expense', label: t('landing_v2.transactions.expense') },
                  { id: 'Transfer', label: t('landing_v2.transactions.transfer') }
                ].map((type) => (
                  <div key={type.id} className="flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background">
                    <div className={`w-2 h-2 rounded-full ${type.id === 'Income' ? 'bg-emerald-400' : type.id === 'Expense' ? 'bg-destructive' : 'bg-primary'}`} />
                    {type.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-card shadow-lg overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/50 flex items-center justify-between">
                <span className="font-semibold">{t('landing_v2.transactions.recent_title')}</span>
                <Button variant="ghost" size="sm">{t('landing_v2.transactions.view_all')}</Button>
              </div>
              <div className="divide-y divide-border">
                {[
                  { name: 'Apple Store', cat: 'Tech', price: '- $14.99', date: t('landing_v2.transactions.today') },
                  { name: 'Starbucks', cat: 'Cafe', price: '- $5.50', date: t('landing_v2.transactions.today') },
                  { name: 'Freelance Web', cat: 'Income', price: '+ $500.00', date: t('landing_v2.transactions.yesterday'), green: true },
                ].map((tr, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                        {tr.name[0]}
                      </div>
                      <div>
                        <div className="font-medium">{tr.name}</div>
                        <div className="text-xs text-muted-foreground">{tr.cat}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${tr.green ? 'text-emerald-500' : ''}`}>{tr.price}</div>
                      <div className="text-xs text-muted-foreground">{tr.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Budgeting Section */}
        <section className="relative z-10 py-24 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {t('landing_v2.budgeting.title')} <br />
                <span className="text-primary">{t('landing_v2.budgeting.subtitle')}</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                {t('landing_v2.budgeting.description')}
              </p>
              <div className="space-y-4">
                {[
                  { label: t('categories.Moradia'), icon: '🏠', val: 75 },
                  { label: t('categories.Alimentação'), icon: '🍕', val: 45 },
                  { label: t('categories.Entretenimento'), icon: '🎨', val: 90 },
                ].map((b, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{b.icon} {b.label}</span>
                      <span className="font-medium text-muted-foreground">{b.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${b.val > 80 ? 'bg-amber-400' : 'bg-primary'}`}
                        style={{ width: `${b.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-slate/900/20 to-slate-500/10 rounded-[40px] flex items-center justify-center overflow-hidden">
                <img src={financeIMG} className='w-full h-full object-cover opacity-80' />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card border border-border p-6 rounded-2xl shadow-xl animate-bounce-slow">
                <TrendingUp className="w-8 h-8 text-primary mb-2" />
                <div className="text-sm font-bold">{t('landing_v2.budgeting.emergency_fund')}</div>
                <div className="text-2xl font-bold text-emerald-500">R$ 12.450</div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="relative z-10 py-24 bg-card/40 backdrop-blur-md border-y border-border overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                {t('landing_v2.security.title')} <br />
                <span className="text-primary">{t('landing_v2.security.subtitle')}</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { title: t('landing_v2.security.f1_title'), desc: t('landing_v2.security.f1_desc') },
                { title: t('landing_v2.security.f2_title'), desc: t('landing_v2.security.f2_desc') },
                { title: t('landing_v2.security.f3_title'), desc: t('landing_v2.security.f3_desc') }
              ].map((s, i) => (
                <div key={i} className="p-8 rounded-3xl border border-border bg-background hover:bg-muted/50 transition-colors group">
                  <Shield className="w-10 h-10 text-primary mb-6 transition-transform group-hover:scale-110" />
                  <h3 className="text-xl font-bold mb-4">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative dots for security section */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </section>

        {/* AI Section (Dark) */}
        <section className="relative z-10 py-32 dark:bg-slate-950/80 backdrop-blur-lg text-white overflow-hidden">
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
              <h2 className="text-4xl text-slate-900 dark:text-white md:text-6xl font-bold mb-8">
                {t('landing_v2.cta.title')} <br />
                <span className="text-primary">{t('landing_v2.cta.subtitle')}</span>
              </h2>
              <p className="text-xl text-slate-900 dark:text-white/60 max-w-2xl mx-auto mb-12">
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
