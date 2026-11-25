import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { RankBadge } from '@/components/rank/RankBadge';
import { useUserRank } from '@/hooks/use-user-rank';
import { getRankLocalized } from '@/types/backoffice';

const UserRankBadge = () => {
    const { t, i18n } = useTranslation();
    const { currentRank, isLoading, isEmptyCatalog } = useUserRank();

    if (isEmptyCatalog) return null;

    if (isLoading) {
        return <Skeleton className="mt-1 h-6 w-40 rounded-md" />;
    }

    if (!currentRank) return null;

    const { title } = getRankLocalized(currentRank, i18n.language);

    return (
        <RankBadge
            variant="compact"
            title={title}
            icon={currentRank.icon}
            color={currentRank.color}
            levelLabel={t('dashboard.rank.level', {
                level: currentRank.level,
                defaultValue: `Nível ${currentRank.level}`,
            })}
            className="mt-0.5"
        />
    );
};

export default UserRankBadge;
