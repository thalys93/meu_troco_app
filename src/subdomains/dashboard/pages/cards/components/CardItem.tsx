import { useState } from "react";
import { Wallet } from "../../../../../types/Wallet";
import { Button } from "@/components/ui/button";
import { Card as UICard, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWalletsStore } from "../../../../../store/useWalletsStore";
import { getCardFlagIcon } from "../../../../../utils/cardUtils";
import { Handbag } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface CardItemProps {
    card: Wallet;
    onEdit: (card: Wallet) => void;
    monthNet?: number;
}

export function CardItem({ card, onEdit, monthNet }: CardItemProps) {
    const { t, i18n } = useTranslation();
    const { deleteWallet } = useWalletsStore();
    const [isHovered, setIsHovered] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language, {
            style: 'currency',
            currency: 'BRL',
        }).format(amount);
    }

    const handleDelete = () => {
        if (confirm(t('wallets.confirmDelete', 'Tem certeza que deseja excluir esta carteira?'))) {
            deleteWallet(card.id);
        }
    };

    return (
        <UICard
            className={cn("overflow-hidden border-2 shadow-md transition-all hover:shadow-lg duration-500")}
            style={{
                borderColor: isHovered ? card.color : 'transparent'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="h-2 w-full" style={{ backgroundColor: card.color }} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {card.name}
                </CardTitle>
                {getCardFlagIcon(card.flag) ? (
                    <img
                        src={getCardFlagIcon(card.flag)!}
                        alt={card.flag}
                        className="h-6 w-auto object-contain"
                    />
                ) : (
                    <Handbag className="h-4 w-4 text-muted-foreground" />
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {formatCurrency(monthNet !== undefined ? monthNet : card.balance)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {monthNet !== undefined
                        ? t("wallets.registeredBalance", { value: formatCurrency(card.balance) })
                        : `${card.accountName} - ${t(`wallets.types.${card.type}`, card.type)}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {t("wallets.linkedAccount", { account: card.accountName })}
                </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 p-2 bg-muted/50">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(card)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleDelete}>
                    <Trash className="h-4 w-4" />
                </Button>
            </CardFooter>
        </UICard>
    );
}
