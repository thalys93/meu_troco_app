import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useWalletsStore } from '@/store/useWalletsStore';
import useUserStore from '@/store/UserStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePocketBalance } from '@/hooks/usePocketBalance';
import { LEGACY_POCKET_CARD_NAME, NO_WALLET_ID } from '@/constants/wallets';
import type { Transaction } from '@/utils/services/api/transation';
import { netByWalletId } from '@/subdomains/dashboard/utils/transaction-month-nets';

const POCKET_COLOR = '#6b7280';

interface BalanceCardProps {
    /** Saldo global (cartões + bolso) quando `scope === 'global'`. */
    balance: number;
    formatCurrency: (value: number) => string;
    /** `global`: limite/saldo cadastrado. `month`: fluxo líquido do mês nas transações passadas. */
    scope?: 'global' | 'month';
    monthTransactions?: Transaction[];
}

const BalanceCard = ({
    balance,
    formatCurrency,
    scope = 'global',
    monthTransactions = [],
}: BalanceCardProps) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const { t } = useTranslation();
    const { wallets, fetchWallets } = useWalletsStore();
    const { user } = useUserStore();
    const pocketBalance = usePocketBalance();
    const realWallets = React.useMemo(
        () => wallets.filter((wallet) => wallet.name !== LEGACY_POCKET_CARD_NAME),
        [wallets]
    );

    const isMonthScope = scope === 'month';

    const nets = useMemo(
        () => (isMonthScope ? netByWalletId(monthTransactions) : null),
        [isMonthScope, monthTransactions]
    );

    const pocketDisplay = isMonthScope && nets ? (nets.get(NO_WALLET_ID) ?? 0) : pocketBalance;

    const cardDisplays = useMemo(() => {
        if (isMonthScope && nets) {
            return realWallets.map((wallet) => ({
                id: wallet.id,
                name: wallet.name,
                color: wallet.color,
                amount: nets.get(wallet.id) ?? 0,
            }));
        }
        return realWallets.map((wallet) => ({
            id: wallet.id,
            name: wallet.name,
            color: wallet.color,
            amount: wallet.balance,
        }));
    }, [isMonthScope, nets, realWallets]);

    const primaryBalance = isMonthScope
        ? monthTransactions.reduce(
              (acc, tr) => acc + (tr.type === 'receita' ? tr.value : -tr.value),
              0
          )
        : balance;

    const titleKey = isMonthScope
        ? 'dashboard.cardTotalTitleMonth'
        : 'dashboard.cardTotalTitle';

    const styles = useMemo(() => {
        if (primaryBalance < 0) {
            return {
                card: "bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900/30 shadow-rose-950/20",
                label: "text-rose-100/80",
                button: "text-rose-100 hover:text-white hover:bg-white/10"
            };
        }
        if (primaryBalance < 50) {
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
    }, [primaryBalance]);

    React.useEffect(() => {
        if (user?.uid) {
            fetchWallets(user.uid);
        }
    }, [user?.uid, fetchWallets]);

    return (
        <Card className={cn("overflow-hidden border-none text-white shadow-xl rounded-3xl transition-all duration-500", styles.card)}>
            <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-0.5">
                        <h2 className={cn("text-sm font-semibold tracking-wide uppercase", styles.label)}>
                            {t(titleKey)}
                        </h2>
                        {isMonthScope && (
                            <span className={cn("text-xs opacity-80", styles.label)}>
                                {t('dashboard.cardTotalMonthHint')}
                            </span>
                        )}
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
                                        {formatCurrency(primaryBalance)}
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

                    <TooltipProvider>
                        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className="w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-125"
                                        style={{ backgroundColor: POCKET_COLOR }}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="text-xs">
                                        <p className="font-semibold">{t('wallets.pocket', LEGACY_POCKET_CARD_NAME)}</p>
                                        <p className="text-muted-foreground">{formatCurrency(pocketDisplay)}</p>
                                        {isMonthScope && (
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {t('wallets.monthFlowCaption')}
                                            </p>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                            {cardDisplays.map((card) => (
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
                                            <p className="text-muted-foreground">{formatCurrency(card.amount)}</p>
                                            {isMonthScope && (
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {t('wallets.monthFlowCaption')}
                                                </p>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
};

export default BalanceCard;
