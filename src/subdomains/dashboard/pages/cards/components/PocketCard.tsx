import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Handbag } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { usePocketBalance } from "@/hooks/usePocketBalance";
import { POCKET_CARD_NAME } from "@/constants/cards";

const POCKET_COLOR = "#6b7280";

export function PocketCard() {
    const { t, i18n } = useTranslation();
    const balance = usePocketBalance();

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
                    {t("cards.pocket", POCKET_CARD_NAME)}
                </CardTitle>
                <Handbag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                    {t("cards.noCard", "Sem Cartão")}
                </p>
            </CardContent>
        </UICard>
    );
}
