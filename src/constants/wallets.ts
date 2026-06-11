export const NO_WALLET_ID = "no_wallet";
export const LEGACY_NO_CARD_ID = "no_card";
export const POCKET_WALLET_NAME = "Sem Carteira (Bolso)";
export const LEGACY_POCKET_CARD_NAME = "Sem Cartão (Bolso)";

export function isPocketWalletId(walletId: string | undefined): boolean {
    return !walletId || walletId === NO_WALLET_ID || walletId === LEGACY_NO_CARD_ID;
}
