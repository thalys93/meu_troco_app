import { NO_CARD_ID } from "@/constants/cards";
import type { Transaction } from "@/utils/services/api/transation";

export const transactionSignedAmount = (tr: Transaction) =>
  tr.type === "receita" ? tr.value : -tr.value;

export const resolveTransactionCardId = (tr: Transaction) =>
  tr.cardId && tr.cardId !== "" ? tr.cardId : NO_CARD_ID;

/** Saldo líquido do período (receitas − despesas) por `cardId` (`no_card` = bolso). */
export function netByCardId(transactions: Transaction[]) {
  const map = new Map<string, number>();
  for (const tr of transactions) {
    const id = resolveTransactionCardId(tr);
    map.set(id, (map.get(id) ?? 0) + transactionSignedAmount(tr));
  }
  return map;
}

export function monthNetTotal(transactions: Transaction[]) {
  return transactions.reduce((acc, tr) => acc + transactionSignedAmount(tr), 0);
}
