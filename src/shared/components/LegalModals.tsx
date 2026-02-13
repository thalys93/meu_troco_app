import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, ShieldCheck } from 'lucide-react'

interface LegalModalsProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    type: 'terms' | 'privacy'
}

const LegalModals: React.FC<LegalModalsProps> = ({ isOpen, onOpenChange, type }) => {
    const { t } = useTranslation()

    const content = type === 'terms'
        ? { title: t('legal.terms_title'), text: t('legal.terms_content'), Icon: FileText }
        : { title: t('legal.privacy_title'), text: t('legal.privacy_content'), Icon: ShieldCheck }

    const Icon = content.Icon

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0 overflow-hidden glass-card border-white/10">
                <DialogHeader className="p-8 pb-4 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
                        <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                        {content.title}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 pt-2">
                    <div className="text-slate-600 dark:text-emerald-100/70 leading-relaxed text-sm space-y-4">                        
                        <p>{content.text}</p>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2 border-t border-white/5">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto font-semibold shadow-lg shadow-primary/20"
                    >
                        {t('legal.close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default LegalModals
