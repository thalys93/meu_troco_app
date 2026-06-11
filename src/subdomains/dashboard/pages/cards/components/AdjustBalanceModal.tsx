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
import { useToast } from "@/hooks/use-toast";
import { useWalletsStore } from "@/store/useWalletsStore";
import type { Wallet } from "@/types/Wallet";

type AdjustBalanceModalProps = {
    wallet: Wallet | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentBalance: number;
};

export function AdjustBalanceModal({ wallet, open, onOpenChange, currentBalance }: AdjustBalanceModalProps) {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { updateWallet } = useWalletsStore();
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);

    const formatter = useMemo(
        () =>
            new Intl.NumberFormat(i18n.language, {
                style: "currency",
                currency: "BRL",
            }),
        [i18n.language]
    );

    useEffect(() => {
        if (open) {
            setValue(currentBalance.toFixed(2));
        }
    }, [currentBalance, open]);

    const targetValue = Number(value.replace(",", "."));
    const isValid = Number.isFinite(targetValue);

    const handleSubmit = async () => {
        if (!wallet || !isValid) return;
        setLoading(true);
        try {
            const delta = targetValue - currentBalance;
            if (wallet.type === "credit") {
                await updateWallet(wallet.id, {
                    creditLimit: Number(wallet.creditLimit ?? wallet.balance ?? 0) + delta,
                });
            } else {
                await updateWallet(wallet.id, {
                    initialBalance: Number(wallet.initialBalance ?? wallet.balance ?? 0) + delta,
                });
            }

            toast({
                title: t("wallets.adjustBalanceSuccessTitle", "Saldo ajustado"),
                description: t("wallets.adjustBalanceSuccessDescription", {
                    value: formatter.format(delta),
                }),
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
                    <DialogTitle>{t("wallets.adjustBalanceTitle", "Ajustar saldo")}</DialogTitle>
                    <DialogDescription>
                        {t(
                            "wallets.adjustBalanceDescription",
                            "Informe o valor real visto no banco ou app do benefício."
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                        <span className="text-muted-foreground">
                            {t("wallets.calculatedBalance", "Valor calculado")}
                        </span>
                        <p className="mt-1 font-semibold">{formatter.format(currentBalance)}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adjust-wallet-balance">
                            {wallet?.type === "credit"
                                ? t("wallets.realAvailableLimit", "Limite disponível real")
                                : t("wallets.realBalance", "Saldo real")}
                        </Label>
                        <Input
                            id="adjust-wallet-balance"
                            type="number"
                            step="0.01"
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {t("common.cancel", "Cancelar")}
                    </Button>
                    <Button type="button" disabled={!isValid || loading} onClick={handleSubmit}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("common.save", "Salvar")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
