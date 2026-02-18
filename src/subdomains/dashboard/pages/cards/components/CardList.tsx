import { useCallback, useEffect, useMemo, useState } from "react";
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useCardsStore } from "../../../../../store/useCardsStore";
import useUserStore from "@/store/UserStore";
import { SortableCardItem } from "./SortableCardItem";
import { PocketCard } from "./PocketCard";
import { AddCardModal } from "./AddCardModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "../../../../../types/Card";
import { useTranslation } from "react-i18next";
import { POCKET_CARD_NAME } from "@/constants/cards";

export function CardList() {
    const { cards, fetchCards, isLoading, reorderCards } = useCardsStore();
    const { user } = useUserStore();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<Card | null>(null);

    const realCards = useMemo(
        () => cards.filter((c) => c.name !== POCKET_CARD_NAME),
        [cards]
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
            const ids = realCards.map((c) => c.id);
            const oldIndex = ids.indexOf(active.id as string);
            const newIndex = ids.indexOf(over.id as string);
            if (oldIndex === -1 || newIndex === -1) return;
            const reordered = [...ids];
            const [removed] = reordered.splice(oldIndex, 1);
            reordered.splice(newIndex, 0, removed);
            reorderCards(reordered);
        },
        [realCards, reorderCards]
    );

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
    };

    if (isLoading && cards.length === 0) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <section className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t("cards.pocket", POCKET_CARD_NAME)}
                </h2>
                <div className="max-w-sm">
                    <PocketCard />
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">{t("cards.title", "Meus Cartões")}</h2>
                    <Button onClick={handleAddNew} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> {t("cards.add", "Adicionar")}
                    </Button>
                </div>

                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={realCards.map((c) => c.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {realCards.map((card) => (
                                <SortableCardItem
                                    key={card.id}
                                    card={card}
                                    onEdit={handleEdit}
                                />
                            ))}

                            {realCards.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center p-8 border rounded-lg border-dashed text-muted-foreground">
                                    <p>{t("cards.empty", "Nenhum cartão cadastrado.")}</p>
                                    <Button variant="link" onClick={handleAddNew}>
                                        {t("cards.createFirst", "Cadastrar o primeiro")}
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
                cardToEdit={editingCard}
            />
        </div>
    );
}
