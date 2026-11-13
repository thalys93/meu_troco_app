/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Languages } from 'lucide-react'
import { useTranslation } from "react-i18next";
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

function LanguageSwitcher({ className }: { className?: string }) {
    const { i18n, t } = useTranslation();

    const languages = [
        { key: 'pt-BR', label: t('lang.portuguese') },
        { key: 'en', label: t('lang.english') },
        { key: 'es', label: t('lang.spanish') },
    ]

    const updateLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
        localStorage.setItem('language', lng);
    }

    React.useEffect(() => {
        const language = localStorage.getItem('language');
        if (language) {
            i18n.changeLanguage(language);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                        'rounded-full text-muted-foreground hover:bg-muted hover:text-foreground',
                        className
                    )}
                    aria-label={t('settings.appearance.languageLabel')}
                >
                    <Languages className="h-5 w-5 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.key}
                        onClick={(e) => { e.preventDefault(); updateLanguage(lang.key); }}
                    >
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default LanguageSwitcher