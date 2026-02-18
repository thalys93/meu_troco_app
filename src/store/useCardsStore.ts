import { create } from 'zustand';
import { Card } from '../types/Card';
import { CardsService } from '../utils/services/api/cards-service';

interface CardsState {
    cards: Card[];
    isLoading: boolean;
    error: string | null;

    fetchCards: (userId: string) => Promise<void>;
    addCard: (card: Omit<Card, "id">) => Promise<void>;
    updateCard: (id: string, card: Partial<Card>) => Promise<void>;
    deleteCard: (id: string) => Promise<void>;
    reorderCards: (orderedIds: string[]) => Promise<void>;

    selectTotalBalance: () => number;
}

export const useCardsStore = create<CardsState>((set, get) => ({
    cards: [],
    isLoading: false,
    error: null,

    fetchCards: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const list = await CardsService.getAll(userId);
            const cards = [...list].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
            set({ cards, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addCard: async (card) => {
        set({ isLoading: true, error: null });
        try {
            const newCard = await CardsService.create(card);
            set(state => ({
                cards: [...state.cards, newCard],
                isLoading: false
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    updateCard: async (id, updatedCard) => {
        set({ isLoading: true, error: null });
        try {
            await CardsService.update(id, updatedCard);
            set(state => ({
                cards: state.cards.map(c => c.id === id ? { ...c, ...updatedCard } : c),
                isLoading: false
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    deleteCard: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await CardsService.delete(id);
            set(state => ({
                cards: state.cards.filter(c => c.id !== id),
                isLoading: false
            }));
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    reorderCards: async (orderedIds) => {
        const { cards } = get();
        const byId = new Map(cards.map(c => [c.id, c]));
        const reordered = orderedIds.map((id, index) => {
            const card = byId.get(id);
            return card ? { ...card, order: index } : null;
        }).filter(Boolean) as Card[];
        if (reordered.length === 0) return;
        set({ cards: reordered });
        try {
            await Promise.all(
                reordered.map((card) => CardsService.update(card.id, { order: card.order }))
            );
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    selectTotalBalance: () => {
        const { cards } = get();
        return cards.reduce((acc, card) => acc + Number(card.balance), 0);
    }
}));
