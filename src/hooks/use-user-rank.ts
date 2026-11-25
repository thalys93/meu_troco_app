import { useEffect, useMemo } from 'react';
import { useUser } from '@/hooks/use-user';
import { useActiveRankTiers } from '@/utils/services/api/goal-templates-service';
import { useUserTransactions } from '@/utils/services/api/transation';
import { useUserRecurrences } from '@/utils/services/api/recurrence';
import { useWalletsStore } from '@/store/useWalletsStore';
import { getCurrentMonthKey, getLocalTodayYmd } from '@/subdomains/dashboard/utils/month-range';
import { computeRankMetrics } from '@/subdomains/dashboard/utils/rank-metrics';
import { resolveAchievedRank } from '@/subdomains/dashboard/utils/rank-resolution';

export function useUserRank() {
    const { user } = useUser();
    const uid = user?.uid;
    const {
        data: activeTiers = [],
        isLoading: isTiersLoading,
        isEmptyCatalog,
    } = useActiveRankTiers();
    const { data: transactions = [], isLoading: isTransactionsLoading } = useUserTransactions();
    const { data: recurrences = [], isLoading: isRecurrencesLoading } = useUserRecurrences();
    const { wallets, fetchWallets } = useWalletsStore();

    useEffect(() => {
        if (uid && wallets.length === 0) {
            fetchWallets(uid);
        }
    }, [uid, wallets.length, fetchWallets]);

    const todayYmd = getLocalTodayYmd();
    const currentMonthKey = getCurrentMonthKey();

    const metrics = useMemo(
        () =>
            computeRankMetrics({
                transactions,
                wallets,
                recurrences,
                todayYmd,
                currentMonthKey,
            }),
        [transactions, wallets, recurrences, todayYmd, currentMonthKey],
    );

    const currentRank = useMemo(
        () => resolveAchievedRank(activeTiers, metrics),
        [activeTiers, metrics],
    );

    const isLoading =
        isTiersLoading || isTransactionsLoading || isRecurrencesLoading;

    return {
        currentRank,
        activeTiers,
        metrics,
        isLoading,
        isEmptyCatalog,
    };
}
