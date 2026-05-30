import React from "react";
import { Split } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NO_WALLET_ID } from "@/constants/wallets";
import type { Wallet } from "@/types/Wallet";
import {
  createAllocationDraftRows,
  type AllocationDraftRow,
} from "@/components/TransactionAllocationsEditor";
import { WalletAllocationRowsPanel } from "@/components/WalletAllocationRowsPanel";
import { getSplitAllocationVisual } from "@/utils/transaction-allocations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InlineWalletSplitControlProps = {
  splitAcrossWallets: boolean;
  onSplitAcrossWalletsChange: (enabled: boolean) => void;
  allocationRows: AllocationDraftRow[];
  onAllocationRowsChange: (rows: AllocationDraftRow[]) => void;
  walletId: string;
  onWalletIdChange: (walletId: string) => void;
  totalValue: number;
  realWallets: Wallet[];
  walletFieldError?: boolean;
  allocationsFieldError?: boolean;
};

const InlineWalletSplitControl = ({
  splitAcrossWallets,
  onSplitAcrossWalletsChange,
  allocationRows,
  onAllocationRowsChange,
  walletId,
  onWalletIdChange,
  totalValue,
  realWallets,
  walletFieldError = false,
  allocationsFieldError = false,
}: InlineWalletSplitControlProps) => {
  const { t, i18n } = useTranslation();
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const currencySymbol = React.useMemo(() => {
    try {
      return (0)
        .toLocaleString(i18n.language, {
          style: "currency",
          currency: i18n.language === "pt-BR" ? "BRL" : "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
        .replace(/\d/g, "")
        .trim();
    } catch {
      return i18n.language === "pt-BR" ? "R$" : "$";
    }
  }, [i18n.language]);

  const selectedWalletCount = allocationRows.filter((row) =>
    row.walletId.trim()
  ).length;
  const splitVisual = getSplitAllocationVisual(
    splitAcrossWallets ? selectedWalletCount : 0
  );

  const toggleSplit = () => {
    const next = !splitAcrossWallets;
    if (next) {
      const seeded = createAllocationDraftRows();
      if (walletId && walletId !== NO_WALLET_ID) {
        seeded[0] = { ...seeded[0], walletId };
      }
      onAllocationRowsChange(seeded);
      onSplitAcrossWalletsChange(true);
      setPopoverOpen(true);
      return;
    }

    const firstWallet = allocationRows.find((row) => row.walletId.trim())?.walletId;
    if (firstWallet) onWalletIdChange(firstWallet);
    onAllocationRowsChange(createAllocationDraftRows());
    onSplitAcrossWalletsChange(false);
    setPopoverOpen(false);
  };

  return (
    <div className="flex min-w-0 items-center gap-1">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant={splitAcrossWallets ? "default" : "ghost"}
              className={cn(
                "h-8 w-8 shrink-0",
                splitAcrossWallets && splitVisual.iconButton
              )}
              onClick={toggleSplit}
              aria-pressed={splitAcrossWallets}
              aria-label={t("transactionList.inline.splitWallets", {
                defaultValue: "Dividir entre carteiras",
              })}
            >
              <Split className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t("transactionList.inline.splitWallets", {
              defaultValue: "Dividir entre carteiras",
            })}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {splitAcrossWallets ? (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-8 min-w-0 flex-1 items-center justify-center rounded-md border px-2 text-xs font-medium tabular-nums transition-colors hover:bg-muted/50",
                allocationsFieldError && "border-red-500",
                splitAcrossWallets ? splitVisual.trigger : "border-border/60 bg-background/80"
              )}
            >
              <span className={cn("truncate", splitVisual.triggerText)}>
                {selectedWalletCount > 0
                  ? `${selectedWalletCount}x`
                  : t("transactionList.inline.configureSplit", {
                      defaultValue: "Configurar",
                    })}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[min(100vw-2rem,320px)] p-3"
            align="start"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t("transactionList.inline.splitTitle", {
                defaultValue: "Rateio entre carteiras",
              })}
            </p>
            <WalletAllocationRowsPanel
              rows={allocationRows}
              onRowsChange={onAllocationRowsChange}
              totalValue={totalValue}
              realWallets={realWallets}
              pocketLabel={t("wallets.noWallet", "Sem Carteira")}
              currencySymbol={currencySymbol}
              locale={i18n.language}
              hasError={allocationsFieldError}
              compact
              configuredWalletCount={selectedWalletCount}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <Select value={walletId} onValueChange={onWalletIdChange}>
          <SelectTrigger
            className={cn(
              "h-8 min-w-0 flex-1 text-xs border-border/60 bg-background/80",
              walletFieldError && "border-red-500"
            )}
          >
            <SelectValue placeholder={t("transactionForm.form.selectWallet")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_WALLET_ID}>
              <span className="text-xs">{t("wallets.noWallet", "Sem Carteira")}</span>
            </SelectItem>
            {realWallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id!}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: wallet.color }}
                  />
                  <span className="truncate text-xs">{wallet.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default InlineWalletSplitControl;
