import { useEffect, useState } from "react";
import { useCardsStore } from "../store/useCardsStore";
import useUserStore from "@/store/UserStore";
import { CardItem } from "./CardItem";
import { AddCardModal } from "./AddCardModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "../types/Card";
import { useTranslation } from "react-i18next";

export function CardList() {
    const { cards, fetchCards, isLoading } = useCardsStore();
    const { user } = useUserStore();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<Card | null>(null);

    useEffect(() => {
        if (user?.uid) {
            fetchCards(user.uid);
        }
    }, [user, fetchCards]);

    const handleEdit = (card: Card) => {
        setEditingCard(card);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingCard(null);
        setIsModalOpen(true);
    }

    if (isLoading && cards.length === 0) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">{t('cards.title', 'Meus Cartões')}</h2>
                <Button onClick={handleAddNew} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> {t('cards.add', 'Adicionar')}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards.map(card => (
                    <CardItem key={card.id} card={card} onEdit={handleEdit} />
                ))}

                {cards.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 border rounded-lg border-dashed text-muted-foreground">
                        <p>{t('cards.empty', 'Nenhum cartão cadastrado.')}</p>
                        <Button variant="link" onClick={handleAddNew}>{t('cards.createFirst', 'Cadastrar o primeiro')}</Button>
                    </div>
                )}
            </div>

            <AddCardModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                cardToEdit={editingCard}
            />
        </div>
    );
}
