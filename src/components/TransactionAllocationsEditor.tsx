import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Wallet } from "@/types/Wallet";
import { WalletAllocationRowsPanel } from "@/components/WalletAllocationRowsPanel";

export type AllocationDraftRow = {
  walletId: string;
  amountDisplay: string;
};

type TransactionAllocationsEditorProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  rows: AllocationDraftRow[];
  onRowsChange: (rows: AllocationDraftRow[]) => void;
  totalValue: number;
  realWallets: Wallet[];
  pocketLabel: string;
  pocketBalanceLabel: string;
  currencySymbol: string;
  locale: string;
  hasError?: boolean;
  configuredWalletCount?: number;
};

const defaultRows = (): AllocationDraftRow[] => [
  { walletId: "", amountDisplay: "" },
  { walletId: "", amountDisplay: "" },
];

export function createAllocationDraftRows(): AllocationDraftRow[] {
  return defaultRows();
}

export function allocationRowsFromTransaction(
  allocations: { walletId: string; amount: number }[],
  locale: string
): AllocationDraftRow[] {
  const sep = locale === "pt-BR" ? "," : ".";
  return allocations.map((item) => ({
    walletId: item.walletId,
    amountDisplay:
      item.amount === 0 ? "" : item.amount.toFixed(2).replace(".", sep),
  }));
}

const TransactionAllocationsEditor = ({
  enabled,
  onEnabledChange,
  rows,
  onRowsChange,
  totalValue,
  realWallets,
  pocketLabel,
  pocketBalanceLabel,
  currencySymbol,
  locale,
  hasError = false,
  configuredWalletCount,
}: TransactionAllocationsEditorProps) => {
  const activeWalletCount =
    configuredWalletCount ?? rows.filter((row) => row.walletId?.trim()).length;

  const handleToggle = (next: boolean) => {
    onEnabledChange(next);
    if (next && rows.every((row) => !row.walletId && !row.amountDisplay)) {
      onRowsChange(defaultRows());
    }
    if (!next) {
      onRowsChange(defaultRows());
    }
  };

  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl border border-accent/40 bg-background/30 p-4 transition-colors",
        enabled && activeWalletCount >= 3 && "border-violet-500/35 bg-violet-500/[0.06]",
        enabled && activeWalletCount === 2 && "border-indigo-500/35 bg-indigo-500/[0.06]",
        hasError && "border-red-500/60 ring-2 ring-red-500/15"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            Dividir entre carteiras
          </Label>
          <p className="text-xs text-muted-foreground">
            Rateie entre 2 ou 3 carteiras
          </p>
        </div>
        <Switch checked={enabled} onEnabledChange={handleToggle} />
      </div>

      {enabled && (
        <WalletAllocationRowsPanel
          rows={rows}
          onRowsChange={onRowsChange}
          totalValue={totalValue}
          realWallets={realWallets}
          pocketLabel={`${pocketLabel} (${pocketBalanceLabel})`}
          currencySymbol={currencySymbol}
          locale={locale}
          hasError={hasError}
          configuredWalletCount={activeWalletCount}
        />
      )}
    </div>
  );
};

export default TransactionAllocationsEditor;
