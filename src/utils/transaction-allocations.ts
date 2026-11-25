import { NO_WALLET_ID } from "@/constants/wallets";
import type { Transaction, WalletAllocation } from "@/utils/services/api/transation";

export const MIN_WALLET_ALLOCATIONS = 2;
export const MAX_WALLET_ALLOCATIONS = 3;
export const ALLOCATION_SUM_TOLERANCE = 0.009;

export function resolveWalletIdFromTransaction(data: Partial<Transaction>): string {
  const walletId = data.walletId?.trim();
  if (walletId) return walletId;
  const legacyCardId = data.cardId?.trim();
  if (legacyCardId) return legacyCardId;
  return NO_WALLET_ID;
}

export function resolveAllocations(transaction: Partial<Transaction>): WalletAllocation[] {
  const allocations = transaction.allocations?.filter(
    (item) => item.walletId?.trim() && item.amount > 0
  );

  if (allocations && allocations.length >= MIN_WALLET_ALLOCATIONS) {
    return allocations.map((item) => ({
      walletId: item.walletId.trim(),
      amount: roundMoney(item.amount),
    }));
  }

  const walletId = resolveWalletIdFromTransaction(transaction);
  const amount = roundMoney(transaction.value ?? 0);
  return [{ walletId, amount }];
}

export function hasMultipleAllocations(transaction: Partial<Transaction>): boolean {
  return resolveAllocations(transaction).length >= MIN_WALLET_ALLOCATIONS;
}

export function getAllocationCount(transaction: Partial<Transaction>): number {
  return resolveAllocations(transaction).length;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function amountsMatchTotal(
  total: number,
  allocations: WalletAllocation[]
): boolean {
  const totalCents = Math.round(roundMoney(total) * 100);
  const sumCents = allocations.reduce(
    (acc, item) => acc + Math.round(roundMoney(item.amount) * 100),
    0
  );
  return totalCents === sumCents;
}

export type AllocationDraftInput = {
  walletId: string;
  amount: number;
};

export function parseAllocationDraftInputs(
  rows: { walletId?: string; amountDisplay: string }[],
  parseAmount: (display: string) => number
): AllocationDraftInput[] {
  return rows.map((row) => ({
    walletId: row.walletId?.trim() ?? "",
    amount: roundMoney(parseAmount(row.amountDisplay)),
  }));
}

export function countCompleteAllocations(entries: AllocationDraftInput[]): number {
  return entries.filter((item) => item.walletId.length > 0 && item.amount > 0).length;
}

export type SplitAllocationVisual = {
  iconButton: string;
  trigger: string;
  triggerText: string;
  badge: string;
  rowBorder: string[];
};

export function getSplitAllocationVisual(walletCount: number): SplitAllocationVisual {
  if (walletCount >= 3) {
    return {
      iconButton: "bg-violet-600 text-white hover:bg-violet-700",
      trigger: "border-violet-500/40 bg-violet-500/5",
      triggerText: "text-violet-700 dark:text-violet-300",
      badge:
        "border-violet-500/35 bg-violet-500/12 text-violet-800 dark:text-violet-300",
      rowBorder: [
        "border-l-violet-500",
        "border-l-fuchsia-500",
        "border-l-purple-500",
      ],
    };
  }
  if (walletCount >= 2) {
    return {
      iconButton: "bg-indigo-600 text-white hover:bg-indigo-700",
      trigger: "border-indigo-500/40 bg-indigo-500/5",
      triggerText: "text-indigo-700 dark:text-indigo-300",
      badge:
        "border-indigo-500/35 bg-indigo-500/12 text-indigo-800 dark:text-indigo-300",
      rowBorder: ["border-l-indigo-500", "border-l-sky-500"],
    };
  }
  return {
    iconButton: "",
    trigger: "border-border/60 bg-background/80",
    triggerText: "text-muted-foreground",
    badge: "border-border/50 bg-muted/50 text-muted-foreground",
    rowBorder: [],
  };
}

export function hasDuplicateWalletIds(allocations: WalletAllocation[]): boolean {
  const ids = allocations.map((item) => item.walletId);
  return new Set(ids).size !== ids.length;
}

export type AllocationValidationFailureReason =
  | "count"
  | "sum"
  | "duplicate"
  | "invalid_amount";

export type AllocationValidationResult =
  | { ok: true; allocations: WalletAllocation[]; walletId: string }
  | { ok: false; reason: AllocationValidationFailureReason };

export function describeAllocationValidationFailure(
  reason: AllocationValidationFailureReason
): string {
  switch (reason) {
    case "sum":
      return "A soma das parcelas deve ser igual ao valor total";
    case "duplicate":
      return "Cada parcela precisa usar uma carteira diferente";
    case "count":
      return "Informe entre 2 e 3 carteiras com valores";
    case "invalid_amount":
      return "Preencha carteira e valor em cada parcela";
    default:
      return "Revise o rateio entre carteiras";
  }
}

export function validateAllocationsForSave(
  totalValue: number,
  allocations: AllocationDraftInput[]
): AllocationValidationResult {
  const entries = allocations.map((item) => ({
    walletId: item.walletId?.trim() ?? "",
    amount: roundMoney(item.amount),
  }));

  const touched = entries.filter(
    (item) => item.walletId.length > 0 || item.amount > 0
  );

  const complete = touched.filter(
    (item) => item.walletId.length > 0 && item.amount > 0
  );

  const incomplete = touched.filter(
    (item) =>
      (item.walletId.length > 0 && item.amount <= 0) ||
      (item.walletId.length === 0 && item.amount > 0)
  );

  if (incomplete.length > 0) {
    return { ok: false, reason: "invalid_amount" };
  }

  if (
    complete.length < MIN_WALLET_ALLOCATIONS ||
    complete.length > MAX_WALLET_ALLOCATIONS
  ) {
    return { ok: false, reason: "count" };
  }

  const normalized: WalletAllocation[] = complete.map((item) => ({
    walletId: item.walletId,
    amount: item.amount,
  }));

  if (hasDuplicateWalletIds(normalized)) {
    return { ok: false, reason: "duplicate" };
  }

  if (!amountsMatchTotal(totalValue, normalized)) {
    return { ok: false, reason: "sum" };
  }

  return {
    ok: true,
    allocations: normalized,
    walletId: normalized[0].walletId,
  };
}

export function buildEqualAllocations(
  totalValue: number,
  walletIds: string[]
): WalletAllocation[] {
  const count = walletIds.length;
  if (count < MIN_WALLET_ALLOCATIONS) return [];

  const totalCents = Math.round(roundMoney(totalValue) * 100);
  const baseCents = Math.floor(totalCents / count);
  const remainder = totalCents - baseCents * count;

  return walletIds.map((walletId, index) => ({
    walletId,
    amount: (baseCents + (index < remainder ? 1 : 0)) / 100,
  }));
}

export function stripAllocationsFromPayload(
  data: Transaction
): Omit<Transaction, "allocations"> & { allocations?: WalletAllocation[] } {
  const { allocations, ...rest } = data;
  if (!allocations || allocations.length < MIN_WALLET_ALLOCATIONS) {
    return rest;
  }
  return { ...rest, allocations };
}
