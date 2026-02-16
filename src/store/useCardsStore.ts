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

    selectTotalBalance: () => number;
}

export const useCardsStore = create<CardsState>((set, get) => ({
    cards: [],
    isLoading: false,
    error: null,

    fetchCards: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const cards = await CardsService.getAll(userId);
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

    selectTotalBalance: () => {
        const { cards } = get();
        return cards.reduce((acc, card) => acc + Number(card.balance), 0);
    }
}));
