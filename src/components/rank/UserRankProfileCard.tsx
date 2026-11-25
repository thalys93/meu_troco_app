import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRankDetailsContent } from '@/components/rank/UserRankDetailsContent';
import { UserRankCatalogSheet } from '@/components/rank/UserRankCatalogSheet';
import { useUserRank } from '@/hooks/use-user-rank';
import { Award, List } from 'lucide-react';

export function UserRankProfileCard() {
    const { t } = useTranslation();
    const { currentRank, activeTiers, metrics, isLoading, isEmptyCatalog } = useUserRank();
    const [catalogOpen, setCatalogOpen] = React.useState(false);

    if (isEmptyCatalog) return null;

    return (
        <Card className="rounded-3xl border border-border/40 shadow-sm h-full overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Award className="h-5 w-5 text-primary" />
                    {t('profile.rank.title', 'Seu rank')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                ) : currentRank ? (
                    <UserRankDetailsContent tier={currentRank} metrics={metrics} />
                ) : (
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'dashboard.rank.noRank',
                            'Continue registrando suas finanças para desbloquear seu primeiro rank.',
                        )}
                    </p>
                )}

                {!isLoading ? (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={() => setCatalogOpen(true)}
                    >
                        <List className="h-4 w-4 mr-2" />
                        {t('dashboard.rank.catalog.viewAll', 'Ver todos os ranks')}
                    </Button>
                ) : null}
            </CardContent>

            <UserRankCatalogSheet
                open={catalogOpen}
                onOpenChange={setCatalogOpen}
                tiers={activeTiers}
                currentRank={currentRank}
                metrics={metrics}
            />
        </Card>
    );
}
