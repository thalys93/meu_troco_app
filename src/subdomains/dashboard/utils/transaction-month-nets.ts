import { NO_WALLET_ID } from "@/constants/wallets";
import type { Transaction } from "@/utils/services/api/transation";
import { resolveAllocations } from "@/utils/transaction-allocations";

export const transactionSignedAmount = (tr: Transaction) =>
  tr.type === "receita" ? tr.value : -tr.value;

export const allocationSignedAmount = (
  type: Transaction["type"],
  amount: number
) => (type === "receita" ? amount : -amount);

export const resolveTransactionWalletId = (tr: Transaction) =>
  tr.walletId && tr.walletId !== "" ? tr.walletId : NO_WALLET_ID;

export function netByWalletId(transactions: Transaction[]) {
  const map = new Map<string, number>();
  for (const tr of transactions) {
    const allocations = resolveAllocations(tr);
    if (allocations.length > 1) {
      for (const allocation of allocations) {
        const id =
          allocation.walletId && allocation.walletId !== ""
            ? allocation.walletId
            : NO_WALLET_ID;
        map.set(
          id,
          (map.get(id) ?? 0) + allocationSignedAmount(tr.type, allocation.amount)
        );
      }
      continue;
    }

    const id = resolveTransactionWalletId(tr);
    map.set(id, (map.get(id) ?? 0) + transactionSignedAmount(tr));
  }
  return map;
}

export const netByCardId = netByWalletId;

export function monthNetTotal(transactions: Transaction[]) {
  return transactions.reduce((acc, tr) => acc + transactionSignedAmount(tr), 0);
}
