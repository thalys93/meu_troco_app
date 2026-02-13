import LanguageSwitcher from '@/components/LanguageSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function Navigation({ type, title }: { type: "simple" | "full", title?: string }) {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const { t } = useTranslation();

    const location = useLocation();

    const isCallBack = location.pathname === "/oauth/callback"

    const navigationItems = [
        { name: t("navigation.home"), href: '#hero' },
        { name: t("navigation.about"), href: '#sobre' },
        { name: t("navigation.funcionalities"), href: '#funcionalidades' },
        // { name: 'Preços', href: '#precos' },
        { name: t('navigation.benefits'), href: '#beneficios' },
    ];

    const scrollToSection = (href: string) => {
        if (location.pathname !== '/') {
            navigate('/' + href);
            return;
        }

        const element = document.querySelector(href);
        if (element) {
            const offset = 80; // Altura do header + um pouco de respiro
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        setMobileMenuOpen(false);
    };

    switch (type) {
        case "full":
            return (
                <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => scrollToSection('#hero')}>
                                <img src="/favicon_big.png" className="w-8 h-8 text-primary group-hover:text-emerald-400 transition-all rounded" />
                                <span className="text-xl font-bold select-none group-hover:text-emerald-400 transition-all">Meu Troco</span>
                            </div>
                            <div className="hidden md:flex items-center space-x-8">
                                {navigationItems.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => scrollToSection(item.href)}
                                        className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                                    >
                                        {item.name}
                                    </button>
                                ))}
                                <div className="flex items-center gap-2">
                                    <LanguageSwitcher />
                                    <ThemeToggle />
                                    <Button onClick={() => navigate('oauth/login')}>
                                        {t("navigation.signIn")}
                                    </Button>
                                </div>
                            </div>

                            <div className="md:hidden flex items-center gap-2">
                                <LanguageSwitcher />
                                <ThemeToggle />
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-muted/50"
                                >
                                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {mobileMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute left-4 right-4 top-[70px] md:hidden p-4 rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl z-50"
                                >
                                    <div className="flex flex-col space-y-1">
                                        {navigationItems.map((item) => (
                                            <button
                                                key={item.name}
                                                onClick={() => scrollToSection(item.href)}
                                                className="flex items-center w-full px-4 py-3 text-left text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-200 font-medium rounded-2xl"
                                            >
                                                {item.name}
                                            </button>
                                        ))}
                                        <div className="pt-4 mt-2 border-t border-border/50">
                                            <Button onClick={() => navigate('oauth/login')} className="w-full rounded-2xl h-12 text-base font-bold">
                                                {t("navigation.signIn")}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>
            );
        case "simple":
            return (
                <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
                                <img src="/favicon_big.png" className="w-8 h-8 text-primary group-hover:text-emerald-400 transition-all rounded" />
                                <span className="text-xl font-bold select-none group-hover:text-emerald-400 transition-all">{title ? title : "Meu Troco"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <LanguageSwitcher />
                                <ThemeToggle />
                                <Button onClick={() => navigate(-1)} disabled={isCallBack}>
                                    {t('navigation.back')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </nav>
            );
    }
}

export default Navigation