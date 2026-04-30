import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Handbag } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { usePocketBalance } from "@/hooks/usePocketBalance";
import { POCKET_WALLET_NAME } from "@/constants/wallets";

const POCKET_COLOR = "#6b7280";

type PocketCardProps = {
    /** Quando definido (layout mês), mostra fluxo líquido do bolso no período em vez do saldo cadastrado. */
    monthNet?: number;
};

export function PocketCard({ monthNet }: PocketCardProps) {
    const { t, i18n } = useTranslation();
    const pocketBalance = usePocketBalance();
    const balance = monthNet !== undefined ? monthNet : pocketBalance;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language, {
            style: "currency",
            currency: "BRL",
        }).format(amount);
    };

    return (
        <UICard className="overflow-hidden border-2 shadow-md transition-all duration-500 border-transparent">
            <div className="h-2 w-full" style={{ backgroundColor: POCKET_COLOR }} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {t("wallets.pocket", POCKET_WALLET_NAME)}
                </CardTitle>
                <Handbag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                    {monthNet !== undefined
                        ? t("wallets.monthFlowCaption")
                        : t("wallets.noWallet", "Sem Carteira")}
                </p>
            </CardContent>
        </UICard>
    );
}
