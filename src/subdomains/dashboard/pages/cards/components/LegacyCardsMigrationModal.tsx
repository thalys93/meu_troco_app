import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { WalletsService } from "@/utils/services/api/wallets-service";
import { setWalletMigrationCompleted } from "@/subdomains/dashboard/utils/wallet-migration";

type LegacyCardsMigrationModalProps = {
    uid: string;
    open: boolean;
    onMigrationSuccess: () => Promise<void> | void;
};

export function LegacyCardsMigrationModal({ uid, open, onMigrationSuccess }: LegacyCardsMigrationModalProps) {
    const [isMigrating, setIsMigrating] = useState(false);
    const { t } = useTranslation();

    const handleMigrate = async () => {
        if (!uid) {
            return;
        }
        setIsMigrating(true);
        try {
            const result = await WalletsService.migrateLegacyCardsToWallets(uid);
            setWalletMigrationCompleted(uid);
            await onMigrationSuccess();
            toast({
                title: t("wallets.migration.successTitle"),
                description: t("wallets.migration.successDescription", {
                    wallets: result.migratedWallets,
                    transactions: result.migratedTransactions,
                }),
            });
        } catch (error) {
            toast({
                title: t("wallets.migration.errorTitle"),
                description: t("wallets.migration.errorDescription"),
                variant: "destructive",
            });
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <Dialog open={open}>
            <DialogContent
                className="sm:max-w-[480px]"
                onInteractOutside={(event) => event.preventDefault()}
                onEscapeKeyDown={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{t("wallets.migration.title")}</DialogTitle>
                    <DialogDescription>{t("wallets.migration.description")}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleMigrate} disabled={isMigrating} className="w-full">
                        {isMigrating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("wallets.migration.running")}
                            </>
                        ) : (
                            t("wallets.migration.cta")
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
