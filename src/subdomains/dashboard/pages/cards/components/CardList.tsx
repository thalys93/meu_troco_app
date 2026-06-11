import { useCallback, useEffect, useMemo, useState } from "react";
import { useUserTransactions } from "@/utils/services/api/transation";
import { useDashboardPreferences } from "@/subdomains/dashboard/context/dashboard-preferences";
import { parseLocalDateInput } from "@/subdomains/dashboard/utils/month-range";
import { LEGACY_POCKET_CARD_NAME, NO_WALLET_ID, POCKET_WALLET_NAME } from "@/constants/wallets";
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useWalletsStore } from "../../../../../store/useWalletsStore";
import useUserStore from "@/store/UserStore";
import { SortableCardItem } from "./SortableCardItem";
import { PocketCard } from "./PocketCard";
import { AddCardModal } from "./AddCardModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Wallet } from "../../../../../types/Wallet";
import { useTranslation } from "react-i18next";
import { WalletsService } from "@/utils/services/api/wallets-service";
import { clearWalletMigrationCompleted, hasCompletedWalletMigration } from "@/subdomains/dashboard/utils/wallet-migration";
import { LegacyCardsMigrationModal } from "@/subdomains/dashboard/pages/cards/components/LegacyCardsMigrationModal";
import { computeWalletDisplayBalance, computeWalletOutflow } from "@/utils/wallet-balance";
import { AdjustBalanceModal } from "@/subdomains/dashboard/pages/cards/components/AdjustBalanceModal";
import { DeleteWalletModal } from "@/subdomains/dashboard/pages/cards/components/DeleteWalletModal";

export function CardList() {
    const { wallets, fetchWallets, isLoading, reorderWallets } = useWalletsStore();
    const { user } = useUserStore();
    const { t, i18n } = useTranslation();
    const { data: allTransactions = [], refetch: refetchTransactions } = useUserTransactions();
    const { selectedMonth } = useDashboardPreferences();
    const pocketMonthOutflow = useMemo(
        () => computeWalletOutflow(NO_WALLET_ID, allTransactions, selectedMonth),
        [allTransactions, selectedMonth]
    );

    const monthLabel = useMemo(() => {
        return new Intl.DateTimeFormat(i18n.language, {
            month: "long",
            year: "numeric",
        }).format(parseLocalDateInput(`${selectedMonth}-01`));
    }, [i18n.language, selectedMonth]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
    const [adjustingWallet, setAdjustingWallet] = useState<Wallet | null>(null);
    const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);
    const [showLegacyMigrationModal, setShowLegacyMigrationModal] = useState(false);

    const realWallets = useMemo(
        () => wallets.filter((wallet) => wallet.name !== LEGACY_POCKET_CARD_NAME),
        [wallets]
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;
            const ids = realWallets.map((wallet) => wallet.id);
            const oldIndex = ids.indexOf(active.id as string);
            const newIndex = ids.indexOf(over.id as string);
            if (oldIndex === -1 || newIndex === -1) return;
            const reordered = [...ids];
            const [removed] = reordered.splice(oldIndex, 1);
            reordered.splice(newIndex, 0, removed);
            reorderWallets(reordered);
        },
        [realWallets, reorderWallets]
    );

    useEffect(() => {
        if (user?.uid) {
            fetchWallets(user.uid);
        }
    }, [user, fetchWallets]);

    useEffect(() => {
        const uid = user?.uid;
        if (!uid) {
            setShowLegacyMigrationModal(false);
            return;
        }
        const completedMigration = hasCompletedWalletMigration(uid);

        let isMounted = true;
        WalletsService.shouldRunLegacyMigration(uid)
            .then((shouldRun) => {
                if (isMounted) {
                    if (shouldRun && completedMigration) {
                        clearWalletMigrationCompleted(uid);
                    }
                    setShowLegacyMigrationModal(shouldRun);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setShowLegacyMigrationModal(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [user?.uid]);

    const handleEdit = (wallet: Wallet) => {
        setEditingWallet(wallet);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingWallet(null);
        setIsModalOpen(true);
    };

    const handleAdjust = (wallet: Wallet) => {
        setAdjustingWallet(wallet);
    };

    const handleDelete = (wallet: Wallet) => {
        setDeletingWallet(wallet);
    };

    if (isLoading && wallets.length === 0) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <section className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t("wallets.pocket", POCKET_WALLET_NAME)}
                </h2>
                <div className="max-w-sm">
                    <PocketCard monthOutflow={pocketMonthOutflow} monthLabel={monthLabel} />
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">{t("wallets.title", "Minhas Carteiras")}</h2>
                        <p className="text-sm text-muted-foreground mt-1 capitalize">
                            {t("wallets.monthContextLabel", { month: monthLabel })}
                        </p>
                    </div>
                    <Button onClick={handleAddNew} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> {t("wallets.add", "Adicionar")}
                    </Button>
                </div>

                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={realWallets.map((wallet) => wallet.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {realWallets.map((wallet) => (
                                <SortableCardItem
                                    key={wallet.id}
                                    card={wallet}
                                    onEdit={handleEdit}
                                    onAdjust={handleAdjust}
                                    onDelete={handleDelete}
                                    displayBalance={computeWalletDisplayBalance(wallet, allTransactions, selectedMonth)}
                                    monthOutflow={computeWalletOutflow(wallet.id, allTransactions, selectedMonth)}
                                    monthLabel={monthLabel}
                                />
                            ))}

                            {realWallets.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center p-8 border rounded-lg border-dashed text-muted-foreground">
                                    <p>{t("wallets.empty", "Nenhuma carteira cadastrada.")}</p>
                                    <Button variant="link" onClick={handleAddNew}>
                                        {t("wallets.createFirst", "Cadastrar a primeira")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            </section>

            <AddCardModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                cardToEdit={editingWallet}
            />
            <AdjustBalanceModal
                wallet={adjustingWallet}
                open={Boolean(adjustingWallet)}
                onOpenChange={(open) => {
                    if (!open) setAdjustingWallet(null);
                }}
                currentBalance={
                    adjustingWallet
                        ? computeWalletDisplayBalance(adjustingWallet, allTransactions, selectedMonth)
                        : 0
                }
            />
            <DeleteWalletModal
                uid={user?.uid}
                wallet={deletingWallet}
                destinationWallets={realWallets}
                open={Boolean(deletingWallet)}
                onOpenChange={(open) => {
                    if (!open) setDeletingWallet(null);
                }}
                onCompleted={async () => {
                    if (user?.uid) {
                        await fetchWallets(user.uid);
                    }
                    await refetchTransactions();
                }}
            />
            {user?.uid && (
                <LegacyCardsMigrationModal
                    uid={user.uid}
                    open={showLegacyMigrationModal}
                    onMigrationSuccess={async () => {
                        await fetchWallets(user.uid);
                        setShowLegacyMigrationModal(false);
                    }}
                />
            )}
        </div>
    );
}
