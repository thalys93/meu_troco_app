import LanguageSwitcher from '@/components/LanguageSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Coins, Menu, X } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

type NavItem = {
    name: string
    href: string
}

function Navigation({
    type,
    title,
}: {
    type: 'simple' | 'full'
    title?: string
}) {
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
    const { t } = useTranslation()
    const location = useLocation()
    const isCallBack = location.pathname === '/oauth/callback'

    const navigationItems: NavItem[] = [
        { name: t('navigation.home'), href: '#hero' },
        { name: t('navigation.dashboard'), href: '#dashboard' },
        { name: t('navigation.transactions'), href: '#transacoes' },
        { name: t('navigation.reports'), href: '#relatorios' },
        { name: t('navigation.forecasts'), href: '#previsoes' },
        { name: t('navigation.profile'), href: '#perfil' },
    ]

    const scrollToSection = (href: string) => {
        const id = href.replace('#', '')

        if (location.pathname !== '/') {
            navigate({ pathname: '/', hash: id })
            setMobileMenuOpen(false)
            return
        }

        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setMobileMenuOpen(false)
    }

    const BrandLogo = ({ label }: { label?: string }) => (
        <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => type === 'full' ? scrollToSection('#hero') : navigate('/')}
        >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
                <Coins className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                    {label ?? t('brand.name')}
                </span>
                {!label && (
                    <span className="text-sm font-semibold text-primary">{t('brand.suffix')}</span>
                )}
            </div>
        </div>
    )

    switch (type) {
        case 'full':
            return (
                <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/40">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            <BrandLogo />

                            <div className="hidden xl:flex items-center gap-6">
                                {navigationItems.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => scrollToSection(item.href)}
                                        className="relative text-sm text-muted-foreground hover:text-primary transition-colors duration-200 font-medium after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>

                            <div className="hidden md:flex items-center gap-2">
                                <LanguageSwitcher />
                                <ThemeToggle />
                                <Button variant="ghost" onClick={() => navigate('oauth/login')}>
                                    {t('navigation.signIn')}
                                </Button>
                                <Button onClick={() => navigate('oauth/register')}>
                                    {t('navigation.signUpFree')}
                                </Button>
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
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
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
                                        <div className="pt-4 mt-2 border-t border-border/50 flex flex-col gap-2">
                                            <Button variant="outline" onClick={() => navigate('oauth/login')} className="w-full rounded-2xl h-12 text-base font-bold">
                                                {t('navigation.signIn')}
                                            </Button>
                                            <Button onClick={() => navigate('oauth/register')} className="w-full rounded-2xl h-12 text-base font-bold">
                                                {t('navigation.signUpFree')}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>
            )
        case 'simple':
            return (
                <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/40">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            <BrandLogo label={title} />
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
            )
    }
}

export default Navigation
