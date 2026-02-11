import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface BalanceCardProps {
    balance: number;
    formatCurrency: (value: number) => string;
}

const BalanceCard = ({ balance, formatCurrency }: BalanceCardProps) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const { t } = useTranslation();

    return (
        <Card className="overflow-hidden border-none bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900/30 text-white shadow-xl shadow-emerald-950/20 rounded-3xl">
            <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-emerald-100/80 tracking-wide uppercase">{t('dashboard.cardTotalTitle')}</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsVisible(!isVisible)}
                        className="text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                </div>

                <div className="space-y-1">
                    <AnimatePresence mode="wait">
                        {isVisible ? (
                            <motion.div
                                key="visible"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl md:text-5xl font-black tracking-tight">
                                        {formatCurrency(balance)}
                                    </span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="hidden"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-1.5 py-4"
                            >
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-stone-200 rounded-full" />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
};

export default BalanceCard;
