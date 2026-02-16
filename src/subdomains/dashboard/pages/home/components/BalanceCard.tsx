import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useCardsStore } from '@/store/useCardsStore';
import useUserStore from '@/store/UserStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BalanceCardProps {
    balance: number;
    formatCurrency: (value: number) => string;
}

const BalanceCard = ({ balance, formatCurrency }: BalanceCardProps) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const { t } = useTranslation();
    const { cards, fetchCards } = useCardsStore();
    const { user } = useUserStore();

    const styles = useMemo(() => {
        if (balance < 0) {
            return {
                card: "bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900/30 shadow-rose-950/20",
                label: "text-rose-100/80",
                button: "text-rose-100 hover:text-white hover:bg-white/10"
            };
        }
        if (balance < 50) {
            return {
                card: "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800/30 shadow-amber-950/20",
                label: "text-amber-100/80",
                button: "text-amber-100 hover:text-white hover:bg-white/10"
            };
        }
        return {
            card: "bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900/30 shadow-emerald-950/20",
            label: "text-emerald-100/80",
            button: "text-emerald-100 hover:text-white hover:bg-white/10"
        };
    }, [balance]);

    React.useEffect(() => {
        if (user?.uid) {
            fetchCards(user.uid);
        }
    }, [user?.uid]);

    return (
        <Card className={cn("overflow-hidden border-none text-white shadow-xl rounded-3xl transition-all duration-500", styles.card)}>
            <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className={cn("text-sm font-semibold tracking-wide uppercase", styles.label)}>
                            {t('dashboard.cardTotalTitle')}
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsVisible(!isVisible)}
                        className={cn("rounded-full transition-colors", styles.button)}
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

                    {/* Card Indicators */}
                    {cards.length > 0 && (
                        <TooltipProvider>
                            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10">
                                {cards.map((card) => (
                                    <Tooltip key={card.id}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className="w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-125"
                                                style={{ backgroundColor: card.color }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="text-xs">
                                                <p className="font-semibold">{card.name}</p>
                                                <p className="text-muted-foreground">{formatCurrency(card.balance)}</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default BalanceCard;
