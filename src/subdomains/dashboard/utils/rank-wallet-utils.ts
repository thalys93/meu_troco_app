import { LEGACY_POCKET_CARD_NAME, POCKET_WALLET_NAME } from '@/constants/wallets';
import type { Wallet } from '@/types/Wallet';

export function isPocketWalletRecord(wallet: Wallet): boolean {
    return wallet.name === LEGACY_POCKET_CARD_NAME || wallet.name === POCKET_WALLET_NAME;
}

/** Carteiras reais do usuário (exclui bolso legado). */
export function countRankableWallets(wallets: Wallet[]): number {
    return wallets.filter((wallet) => !isPocketWalletRecord(wallet)).length;
}
