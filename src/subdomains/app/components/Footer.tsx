import React from 'react'
import { Coins } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LegalModals from '@/shared/components/LegalModals'
import { Link, useLocation } from 'react-router-dom'
import { LinkedinLogo, ThreadsLogoIcon } from '@phosphor-icons/react'

function Footer() {
    const { t } = useTranslation();
    const location = useLocation();
    const shouldShowBackofficeLink = !location.pathname.startsWith('/backoffice');

    const [legalModal, setLegalModal] = React.useState<{ isOpen: boolean, type: 'terms' | 'privacy' }>({
        isOpen: false,
        type: 'terms'
    });

    const openLegalModal = (e: React.MouseEvent, type: 'terms' | 'privacy') => {
        e.preventDefault();
        e.stopPropagation();
        setLegalModal({ isOpen: true, type });
    };

    return (
        <footer className="border-t border-border/50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
                                    <Coins className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-lg font-bold tracking-tight">{t('brand.name')}</span>
                                    <span className="text-sm font-semibold text-primary">{t('brand.suffix')}</span>
                                </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('footer.description')}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Links</h3>
                            <div className="space-y-2">
                                <a
                                    href="#"
                                    onClick={(e) => openLegalModal(e, 'privacy')}
                                    className="block text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {t('footer.privacy_policy')}
                                </a>
                                <a
                                    href="#"
                                    onClick={(e) => openLegalModal(e, 'terms')}
                                    className="block text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {t('footer.terms_of_use')}
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">{t('footer.social_groups')}</h3>
                            <div className="flex gap-4">
                                <a href="https://www.linkedin.com/in/thalys-dev202/" className="text-muted-foreground/50 hover:text-primary transition-colors">
                                    <LinkedinLogo className="w-5 h-5" />
                                </a>
                                <a href="https://www.threads.com/@thalys_xavierr" className="text-muted-foreground/50 hover:text-primary transition-colors">
                                    <ThreadsLogoIcon className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground select-none hover:text-primary transition-all">
                        {shouldShowBackofficeLink ? (
                            <Link to="/backoffice/login" aria-label={t('footer.backoffice_access', 'Acesso operacional')} className="inline-block cursor-pointer">
                                &copy; {new Date().getFullYear()} {t('brand.full')}. {t('footer.all_rights')}.
                            </Link>
                        ) : (
                            <p>&copy; {new Date().getFullYear()} {t('brand.full')}. {t('footer.all_rights')}.</p>
                        )}
                    </div>
                </div>
            </div>

            <LegalModals
                isOpen={legalModal.isOpen}
                onOpenChange={(open) => setLegalModal(prev => ({ ...prev, isOpen: open }))}
                type={legalModal.type}
            />
        </footer>
    )
}

export default Footer
