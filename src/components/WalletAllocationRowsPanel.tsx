import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { NO_WALLET_ID } from "@/constants/wallets";
import type { Wallet } from "@/types/Wallet";
import type { AllocationDraftRow } from "@/components/TransactionAllocationsEditor";
import {
  amountsMatchTotal,
  buildEqualAllocations,
  getSplitAllocationVisual,
  MAX_WALLET_ALLOCATIONS,
  MIN_WALLET_ALLOCATIONS,
  roundMoney,
} from "@/utils/transaction-allocations";

function parseAmountDisplay(value: string): number {
  return parseFloat((value || "0").replace(",", ".")) || 0;
}

function sanitizeAmountInput(raw: string): string {
  let s = raw.replace(/[^0-9,.]/g, "");
  const firstComma = s.indexOf(",");
  const firstDot = s.indexOf(".");
  if (firstComma >= 0 && firstDot >= 0) {
    const sepIdx = Math.min(firstComma, firstDot);
    const sep = s[sepIdx];
    s =
      s.slice(0, sepIdx + 1) +
      s.slice(sepIdx + 1).replace(sep === "," ? /\./g : /,/g, "");
  }
  const sepIdx = s.includes(",") ? s.indexOf(",") : s.indexOf(".");
  if (sepIdx >= 0 && s.length > sepIdx + 3) {
    s = s.slice(0, sepIdx + 3);
  }
  return s;
}

export type WalletAllocationRowsPanelProps = {
  rows: AllocationDraftRow[];
  onRowsChange: (rows: AllocationDraftRow[]) => void;
  totalValue: number;
  realWallets: Wallet[];
  pocketLabel: string;
  currencySymbol: string;
  locale: string;
  hasError?: boolean;
  compact?: boolean;
  configuredWalletCount?: number;
};

export function WalletAllocationRowsPanel({
  rows,
  onRowsChange,
  totalValue,
  realWallets,
  pocketLabel,
  currencySymbol,
  locale,
  hasError = false,
  compact = false,
  configuredWalletCount,
}: WalletAllocationRowsPanelProps) {
  const activeWalletCount =
    configuredWalletCount ?? rows.filter((row) => row.walletId.trim()).length;
  const splitVisual = getSplitAllocationVisual(activeWalletCount);

  const parsedRows = rows.map((row) => ({
    walletId: row.walletId,
    amount: parseAmountDisplay(row.amountDisplay),
  }));

  const allocatedSum = roundMoney(
    parsedRows.reduce((acc, row) => acc + row.amount, 0)
  );
  const remaining = roundMoney(totalValue - allocatedSum);
  const sumIsValid = amountsMatchTotal(
    totalValue,
    parsedRows.filter((row) => row.amount > 0 && row.walletId)
  );

  const handleDistributeEqually = () => {
    const walletIds = rows
      .map((row) => row.walletId.trim())
      .filter((id) => id.length > 0);
    if (walletIds.length < MIN_WALLET_ALLOCATIONS || totalValue <= 0) return;

    const equal = buildEqualAllocations(totalValue, walletIds);
    const sep = locale === "pt-BR" ? "," : ".";
    onRowsChange(
      equal.map((item) => ({
        walletId: item.walletId,
        amountDisplay: item.amount.toFixed(2).replace(".", sep),
      }))
    );
  };

  const updateRow = (index: number, patch: Partial<AllocationDraftRow>) => {
    onRowsChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    if (rows.length >= MAX_WALLET_ALLOCATIONS) return;
    onRowsChange([...rows, { walletId: "", amountDisplay: "" }]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= MIN_WALLET_ALLOCATIONS) return;
    onRowsChange(rows.filter((_, i) => i !== index));
  };

  const rowHeight = compact ? "h-8" : "h-11";
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div
      className={cn(
        "space-y-2",
        !compact && "rounded-2xl border border-accent/40 bg-background/30 p-4",
        hasError && !compact && "border-red-500/60 ring-2 ring-red-500/15",
        hasError && compact && "rounded-lg ring-2 ring-red-500/20"
      )}
    >
      {rows.map((row, index) => (
        <div
          key={`allocation-row-${index}`}
          className={cn(
            "grid gap-2 border-l-2 pl-2",
            splitVisual.rowBorder[index] ?? "border-l-border",
            compact ? "grid-cols-[1fr_88px_28px]" : "grid-cols-1 sm:grid-cols-[1fr_120px_auto]"
          )}
        >
          <Select
            value={row.walletId || undefined}
            onValueChange={(walletId) => updateRow(index, { walletId })}
          >
            <SelectTrigger
              className={cn(
                rowHeight,
                textSize,
                "border-border/60 bg-background/80",
                compact && "rounded-md"
              )}
            >
              <SelectValue placeholder="Carteira" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_WALLET_ID}>
                <span className={textSize}>{pocketLabel}</span>
              </SelectItem>
              {realWallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: wallet.color }}
                    />
                    <span className={textSize}>{wallet.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <span
              className={cn(
                "pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground",
                compact ? "text-[10px]" : "text-sm"
              )}
            >
              {currencySymbol}
            </span>
            <Input
              value={row.amountDisplay}
              onChange={(event) =>
                updateRow(index, {
                  amountDisplay: sanitizeAmountInput(event.target.value),
                })
              }
              inputMode="decimal"
              placeholder="0,00"
              className={cn(
                rowHeight,
                textSize,
                "border-border/60 bg-background/80 pl-7",
                compact && "rounded-md"
              )}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 text-muted-foreground",
              compact ? "h-8 w-7" : "h-11 w-11"
            )}
            disabled={rows.length <= MIN_WALLET_ALLOCATIONS}
            onClick={() => removeRow(index)}
            aria-label="Remover parcela"
          >
            <Trash2 className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </Button>
        </div>
      ))}

      <div className={cn("flex flex-wrap items-center justify-between gap-2", compact && "pt-0.5")}>
        <div className={cn("text-xs", compact && "text-[11px]")}>
          <span
            className={cn(
              "font-medium",
              sumIsValid
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            )}
          >
            {currencySymbol} {allocatedSum.toFixed(2)}
          </span>
          <span className="mx-1.5 text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {currencySymbol} {remaining.toFixed(2)}
          </span>
        </div>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(compact && "h-7 px-2 text-[11px]")}
            onClick={handleDistributeEqually}
            disabled={totalValue <= 0}
          >
            Igual
          </Button>
          {rows.length < MAX_WALLET_ALLOCATIONS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn("gap-1", compact && "h-7 px-2 text-[11px]")}
              onClick={addRow}
            >
              <Plus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              +
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
