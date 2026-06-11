import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { NO_WALLET_ID } from "@/constants/wallets";
import { useWalletsStore } from "@/store/useWalletsStore";
import type { Wallet } from "@/types/Wallet";
import { WalletsService } from "@/utils/services/api/wallets-service";

type DeleteWalletAction = "pocket" | "wallet" | "delete";

type DeleteWalletModalProps = {
    uid?: string;
    wallet: Wallet | null;
    destinationWallets: Wallet[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCompleted: () => Promise<void> | void;
};

export function DeleteWalletModal({
    uid,
    wallet,
    destinationWallets,
    open,
    onOpenChange,
    onCompleted,
}: DeleteWalletModalProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { deleteWallet } = useWalletsStore();
    const [linkedCount, setLinkedCount] = useState(0);
    const [action, setAction] = useState<DeleteWalletAction>("pocket");
    const [destinationWalletId, setDestinationWalletId] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);

    const availableDestinationWallets = useMemo(
        () => destinationWallets.filter((item) => item.id !== wallet?.id),
        [destinationWallets, wallet?.id]
    );

    useEffect(() => {
        if (!open || !uid || !wallet) {
            setLinkedCount(0);
            setAction("pocket");
            setDestinationWalletId("");
            setConfirmation("");
            return;
        }

        let isMounted = true;
        WalletsService.getTransactionsByWallet(uid, wallet.id)
            .then((transactions) => {
                if (isMounted) setLinkedCount(transactions.length);
            })
            .catch(() => {
                if (isMounted) setLinkedCount(0);
            });

        return () => {
            isMounted = false;
        };
    }, [open, uid, wallet]);

    const canSubmit =
        Boolean(uid && wallet) &&
        !loading &&
        (action !== "wallet" || Boolean(destinationWalletId)) &&
        (action !== "delete" || linkedCount === 0 || confirmation === wallet?.name);

    const handleDelete = async () => {
        if (!uid || !wallet || !canSubmit) return;
        setLoading(true);
        try {
            if (linkedCount > 0) {
                if (action === "wallet") {
                    await WalletsService.reassignTransactions(uid, wallet.id, destinationWalletId);
                }
                if (action === "pocket") {
                    await WalletsService.reassignTransactions(uid, wallet.id, NO_WALLET_ID);
                }
                if (action === "delete") {
                    await WalletsService.deleteTransactionsByWallet(uid, wallet.id);
                }
            }

            await deleteWallet(wallet.id);
            await onCompleted();
            toast({
                title: t("wallets.deleteSuccessTitle", "Carteira excluída"),
                description: t("wallets.deleteSuccessDescription", "Os lançamentos vinculados foram tratados conforme sua escolha."),
            });
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("wallets.deleteTitle", "Excluir carteira")}</DialogTitle>
                    <DialogDescription>
                        {t("wallets.deleteDescription", {
                            count: linkedCount,
                            wallet: wallet?.name ?? "",
                        })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                        {t("wallets.linkedTransactionsCount", {
                            count: linkedCount,
                        })}
                    </div>

                    <RadioGroup value={action} onValueChange={(value) => setAction(value as DeleteWalletAction)}>
                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <RadioGroupItem value="pocket" id="delete-wallet-pocket" />
                            <Label htmlFor="delete-wallet-pocket" className="grid gap-1">
                                <span>{t("wallets.moveTransactionsToPocket", "Mover lançamentos para o Bolso")}</span>
                                <span className="text-xs font-normal text-muted-foreground">
                                    {t("wallets.moveTransactionsToPocketHint", "A carteira será excluída e os lançamentos ficarão como Sem Carteira.")}
                                </span>
                            </Label>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border p-3">
                            <RadioGroupItem value="wallet" id="delete-wallet-destination" />
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="delete-wallet-destination">
                                    {t("wallets.moveTransactionsToWallet", "Mover para outra carteira")}
                                </Label>
                                {action === "wallet" && (
                                    <Select value={destinationWalletId} onValueChange={setDestinationWalletId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("wallets.selectDestinationWallet", "Selecione a carteira")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableDestinationWallets.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 p-3">
                            <RadioGroupItem value="delete" id="delete-wallet-transactions" />
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="delete-wallet-transactions">
                                    {t("wallets.deleteWalletAndTransactions", "Excluir carteira e lançamentos")}
                                </Label>
                                {action === "delete" && linkedCount > 0 && (
                                    <Input
                                        value={confirmation}
                                        onChange={(event) => setConfirmation(event.target.value)}
                                        placeholder={wallet?.name}
                                    />
                                )}
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {t("common.cancel", "Cancelar")}
                    </Button>
                    <Button type="button" variant="destructive" disabled={!canSubmit} onClick={handleDelete}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("common.delete", "Excluir")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
