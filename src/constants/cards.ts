import {
    LEGACY_NO_CARD_ID,
    LEGACY_POCKET_CARD_NAME,
    NO_WALLET_ID,
    POCKET_WALLET_NAME,
    isPocketWalletId,
} from "@/constants/wallets";

export const NO_CARD_ID = LEGACY_NO_CARD_ID;
export const NO_WALLET_CARD_ID = NO_WALLET_ID;
export const POCKET_CARD_NAME = LEGACY_POCKET_CARD_NAME;
export const POCKET_WALLET_CARD_NAME = POCKET_WALLET_NAME;

export function isPocketCardId(cardId: string | undefined): boolean {
    return isPocketWalletId(cardId);
}
