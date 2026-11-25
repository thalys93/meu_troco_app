import { Wallet } from "@/types/Wallet";
import { WalletsService } from "@/utils/services/api/wallets-service";

export const CardsService = {
    getAll: (userId: string): Promise<Wallet[]> => WalletsService.getAll(userId),
    getById: (id: string): Promise<Wallet | null> => WalletsService.getById(id),
    create: (card: Omit<Wallet, "id">): Promise<Wallet> => WalletsService.create(card),
    update: (id: string, card: Partial<Wallet>): Promise<void> => WalletsService.update(id, card),
    delete: (id: string): Promise<void> => WalletsService.delete(id),
};
