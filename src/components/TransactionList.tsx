import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Receipt, Loader2, EllipsisVertical, Trash, Pen, ChevronLeft, ChevronRight, Plus, ChevronDown, ChevronRight as ChevronRightIcon, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction, type TransactionType, useDeleteTransaction, useToggleBillPaid, useUserTransactions } from '@/utils/services/api/transation';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import TransactionRowActionsMenu, { TransactionRowActionsDropdown } from './transaction-table/TransactionRowActionsMenu';
import TransactionTableInlineRow from './transaction-table/TransactionTableInlineRow';
import {
  createEmptyDraft,
  draftFromTransaction,
  InlineTransactionDraft,
} from './transaction-table/transaction-inline-utils';
import DeleteDialog from './DeleteDialog';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import useUserStore from '@/store/UserStore';
import { useTranslation } from 'react-i18next';
import TransactionFiltersDialog from './TransactionFiltersDialog';
import TransactionForm from './TransactionForm';
import { useCategories } from '@/hooks/use-categories';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import {
  getMonthRangeByKey,
  isCurrentMonthKey,
  normalizeLocalDateString,
  parseLocalDateInput,
  parseMonthKey,
} from '@/subdomains/dashboard/utils/month-range';
import {
  defaultTransactionListFiltersPreference,
  useDashboardPreferences,
  type TransactionTableSortColumn,
} from '@/subdomains/dashboard/context/dashboard-preferences';
import { transactionSignedAmount } from '@/subdomains/dashboard/utils/transaction-month-nets';
import {
  compareTransactionsByColumn,
  filterTransactionsByPreferences,
  getDefaultSortOrderForColumn,
  isBillPaid,
  summarizeIncomeExpense,
  summarizeTransactionTypes,
} from '@/subdomains/dashboard/utils/transaction-filters';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useWalletsStore } from '@/store/useWalletsStore';
import { NO_WALLET_ID } from '@/constants/wallets';
import {
  getAllocationCount,
  getSplitAllocationVisual,
  hasMultipleAllocations,
  resolveAllocations,
} from '@/utils/transaction-allocations';
import {
  createOverlayDismissGuard,
  deferDropdownMenuAction,
} from '@/lib/dropdown-menu-action';
import { useAccountStatus } from '@/hooks/use-account-status';

/** Portais Radix + calendário (react-day-picker `.rdp`) ficam fora do nó do Dialog; precisamos ignorar esses cliques. */
const QUICK_ADD_OUTSIDE_PORTAL_SELECTOR =
  '[data-radix-popper-content-wrapper],[data-radix-menu-content],[data-radix-select-viewport],.rdp';

const TRANSACTION_INLINE_ROW_SELECTOR = '[data-transaction-inline-row]';
const TRANSACTION_DATA_ROW_SELECTOR = '[data-transaction-row-id]';
const TRANSACTION_INSTALLMENT_ROW_SELECTOR = '[data-transaction-installment-row]';
const TRANSACTION_ADD_ROW_SELECTOR = '[data-transaction-add-row]';

type TransactionDayGroup = {
  dateKey: string;
  label: string;
  items: Transaction[];
};

const TABLE_HEAD_CLASS =
  "sticky top-0 z-20 h-11 border-b border-border/50 bg-background py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border)/0.4)]";

type SortableTableHeadProps = {
  column: TransactionTableSortColumn;
  label: string;
  activeColumn: TransactionTableSortColumn;
  sortOrder: "asc" | "desc";
  onSort: (column: TransactionTableSortColumn) => void;
  className?: string;
  align?: "left" | "right" | "center";
};

function SortableTableHead({
  column,
  label,
  activeColumn,
  sortOrder,
  onSort,
  className,
  align = "left",
}: SortableTableHeadProps) {
  const isActive = activeColumn === column;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-foreground",
          align === "right" && "ml-auto",
          align === "center" && "mx-auto",
          isActive && "text-foreground"
        )}
      >
        {label}
        {isActive &&
          (sortOrder === "desc" ? (
            <ArrowDown className="h-3.5 w-3.5" />
          ) : (
            <ArrowUp className="h-3.5 w-3.5" />
          ))}
      </button>
    </TableHead>
  );
}

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

function elementFromEventTarget(target: EventTarget | null): Element | null {
  if (!target) return null;
  if (target instanceof Element) return target;
  if (target instanceof Text) return target.parentElement;
  return null;
}

function isInsideQuickAddNestedLayer(node: EventTarget | null): boolean {
  const el = elementFromEventTarget(node);
  if (!el) return false;
  return Boolean(el.closest(QUICK_ADD_OUTSIDE_PORTAL_SELECTOR));
}

function hasOpenInlineEditOverlay(): boolean {
  const poppers = document.querySelectorAll('[data-radix-popper-content-wrapper]');
  for (const popper of poppers) {
    if (
      popper.querySelector('[data-state="open"]') ||
      popper.querySelector('[cmdk-list]')
    ) {
      return true;
    }
  }
  return false;
}

/** Evita fechar o Sheet ao interagir com Popover/Select/Calendar em portal (usa composedPath por causa de shadow/text nodes). */
function preventQuickAddSheetDismissIfFromNestedPortal(event: {
  preventDefault: () => void;
  target: EventTarget;
  detail?: { originalEvent?: Event };
}): void {
  const orig = event.detail?.originalEvent as
    | (Event & { composedPath?: () => EventTarget[] })
    | undefined;
  if (orig && typeof orig.composedPath === 'function') {
    for (const n of orig.composedPath()) {
      if (isInsideQuickAddNestedLayer(n)) {
        event.preventDefault();
        return;
      }
    }
  }
  if (isInsideQuickAddNestedLayer(orig?.target ?? null) || isInsideQuickAddNestedLayer(event.target)) {
    event.preventDefault();
  }
}

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  isLoading: boolean
  limit?: number
  scrollClassName?: string
  selectedMonth?: string
  onPreviousMonth?: () => void
  onNextMonth?: () => void
  onResetCurrentMonth?: () => void
  /** `table`: visão estilo planilha (desktop). */
  variant?: 'list' | 'table'
  formatCurrency?: (value: number) => string
  showQuickAdd?: boolean
}

const TransactionList = ({
  transactions,
  title = "Transações Recentes",
  isLoading,
  limit,
  scrollClassName = 'max-h-[350px] overflow-auto',
  selectedMonth,
  onPreviousMonth,
  onNextMonth,
  onResetCurrentMonth,
  variant = 'list',
  formatCurrency,
  showQuickAdd = false,
}: TransactionListProps) => {
  const useInlineTable = variant === 'table' && showQuickAdd;
  const displayTransactions = limit ? transactions?.slice(0, limit) : transactions;
  const { uid } = useUserStore();
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction>()
  const { mutate, isPending } = useDeleteTransaction()
  const { mutate: toggleBillPaid, isPending: isTogglingPaid } = useToggleBillPaid()
  const { refetch } = useUserTransactions()
  const { t, i18n } = useTranslation();
  const { getCategoryIcon, getCategoryLabel, categoryLookup } = useCategories();
  const { wallets, fetchWallets } = useWalletsStore();
  const { transactionListFilters, setTransactionListFilters } =
    useDashboardPreferences();
  const { isReadOnly } = useAccountStatus();

  const filterCard = transactionListFilters.card;
  const filterCategories = transactionListFilters.categories;
  const filterType = transactionListFilters.type;
  const minValue = transactionListFilters.minValue;
  const maxValue = transactionListFilters.maxValue;
  const startDate = transactionListFilters.startDate;
  const endDate = transactionListFilters.endDate;
  const tableSortColumn = transactionListFilters.tableSortColumn;
  const tableSortOrder = transactionListFilters.tableSortOrder;
  const dateRangeLockedToMonth =
    transactionListFilters.dateRangeLockedToMonth;

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const sheetDismissGuardRef = React.useRef(createOverlayDismissGuard());
  const deleteDismissGuardRef = React.useRef(createOverlayDismissGuard());
  const [sheetCreateType, setSheetCreateType] = React.useState<TransactionType>('receita');
  const [sheetEditId, setSheetEditId] = React.useState<string | null>(null);
  const [sheetEditType, setSheetEditType] = React.useState<TransactionType>('receita');
  const [togglingPaidId, setTogglingPaidId] = React.useState<string | null>(null);
  const [inlineSession, setInlineSession] = React.useState<{
    mode: 'create' | 'edit';
    transactionId?: string;
    draft: InlineTransactionDraft;
  } | null>(null);
  const [expandedTransactionIds, setExpandedTransactionIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(false);
  const isTableVariant = variant === 'table';
  const showPaidColumn = filterType === 'Todos' || filterType === 'conta';
  const tableColumnCount = showPaidColumn ? 8 : 7;
  const monthRange = React.useMemo(
    () => (selectedMonth ? getMonthRangeByKey(selectedMonth) : undefined),
    [selectedMonth]
  );

  /** Quando true, "De/Até" acompanham o mês do seletor; ao editar datas no filtro, fica false para permitir intervalos entre meses. */
  React.useEffect(() => {
    if (!monthRange || !dateRangeLockedToMonth) return;
    setTransactionListFilters((prev) => {
      if (!prev.dateRangeLockedToMonth) return prev;
      if (
        prev.startDate === monthRange.startDate &&
        prev.endDate === monthRange.endDate
      ) {
        return prev;
      }
      return {
        ...prev,
        startDate: monthRange.startDate,
        endDate: monthRange.endDate,
      };
    });
  }, [monthRange, dateRangeLockedToMonth, setTransactionListFilters]);

  React.useEffect(() => {
    if (!uid || wallets.length > 0) return;
    fetchWallets(uid);
  }, [wallets.length, fetchWallets, uid]);

  const handlePreviousMonthClick = React.useCallback(() => {
    setTransactionListFilters((prev) => ({
      ...prev,
      dateRangeLockedToMonth: true,
    }));
    onPreviousMonth?.();
  }, [onPreviousMonth, setTransactionListFilters]);

  const handleNextMonthClick = React.useCallback(() => {
    setTransactionListFilters((prev) => ({
      ...prev,
      dateRangeLockedToMonth: true,
    }));
    onNextMonth?.();
  }, [onNextMonth, setTransactionListFilters]);

  const handleResetCurrentMonthClick = React.useCallback(() => {
    setTransactionListFilters((prev) => ({
      ...prev,
      dateRangeLockedToMonth: true,
    }));
    onResetCurrentMonth?.();
  }, [onResetCurrentMonth, setTransactionListFilters]);

  const handleFiltersClearAll = React.useCallback(() => {
    setTransactionListFilters({
      ...defaultTransactionListFiltersPreference,
      dateRangeLockedToMonth: true,
      startDate: monthRange?.startDate ?? '',
      endDate: monthRange?.endDate ?? '',
    });
  }, [monthRange, setTransactionListFilters]);


  const formatAmount = (amount: number, type: TransactionType) => {
    if (formatCurrency) {
      const base = formatCurrency(amount);
      return type === 'receita' ? `+${base}` : `-${base}`;
    }
    const formatted = `$${amount.toLocaleString()}`;
    return type === 'receita' ? `+${formatted}` : `-${formatted}`;
  };

  const formatSummaryValue = React.useCallback((amount: number) => {
    if (formatCurrency) {
      return formatCurrency(amount);
    }
    return `$${amount.toLocaleString()}`;
  }, [formatCurrency]);

  const formatTableDate = (dateString: string) => {
    const date = parseLocalDateInput(dateString);
    if (!isValidDate(date)) return dateString;
    return date.toLocaleDateString(i18n.language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDate = (dateString: string) => {
    const date = parseLocalDateInput(dateString);
    if (!isValidDate(date)) return dateString;
    return date.toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
  }

  const isYesterday = (date: Date) => {
    const now = new Date();
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    return date.getFullYear() === y.getFullYear() &&
      date.getMonth() === y.getMonth() &&
      date.getDate() === y.getDate();
  }

  const handleDelete = (id: string) => {
    if (isReadOnly) {
      toast({
        title: t('toast.error'),
        description: t('account.blocked.banner', 'Sua conta está bloqueada para alterações. Você pode consultar seus dados, mas não pode criar ou editar informações.'),
        variant: 'destructive',
      });
      return;
    }

    mutate({ uid, id }, {
      onSuccess: () => {
        toast({
          title: "Transação excluida",
          description: "Transação excluida com sucesso",
          variant: "destructive"
        })
        refetch()
      },
      onError: () => {
        toast({
          title: "Erro ao excluir transação",
          description: "Erro ao excluir transação",
          variant: "destructive"
        })
      }
    })
  }

  const isPendingTransaction = (id?: string) => {
    if (!id) return false;
    return isPending && selectedTransaction?.id === id
  }

  const walletsById = React.useMemo(
    () => new Map(wallets.map((wallet) => [wallet.id, wallet])),
    [wallets]
  );

  const getWalletBadgeData = React.useCallback((walletId?: string) => {
    if (!walletId || walletId === NO_WALLET_ID) {
      return {
        name: t('wallets.noWallet', 'Sem Carteira'),
        color: '#6b7280',
      };
    }
    const wallet = walletsById.get(walletId);
    if (!wallet) {
      return {
        name: t('wallets.noWallet', 'Sem Carteira'),
        color: '#6b7280',
      };
    }
    return {
      name: wallet.name,
      color: wallet.color || '#6b7280',
    };
  }, [walletsById, t]);

  const sortFilterOptions = React.useMemo(
    () => ({
      categoryLookup,
      resolveWalletName: (walletId?: string) => getWalletBadgeData(walletId).name,
      resolveCategoryLabel: getCategoryLabel,
    }),
    [categoryLookup, getCategoryLabel, getWalletBadgeData]
  );

  const effectiveFilters = React.useMemo(() => {
    if (!selectedMonth || !dateRangeLockedToMonth || !monthRange) {
      return transactionListFilters;
    }
    return {
      ...transactionListFilters,
      startDate: monthRange.startDate,
      endDate: monthRange.endDate,
    };
  }, [dateRangeLockedToMonth, monthRange, selectedMonth, transactionListFilters]);

  const filteredTransactions = React.useMemo(
    () =>
      filterTransactionsByPreferences(displayTransactions || [], effectiveFilters, sortFilterOptions),
    [displayTransactions, effectiveFilters, sortFilterOptions]
  );

  const tableFilteredSummary = React.useMemo(() => {
    return summarizeTransactionTypes(filteredTransactions);
  }, [filteredTransactions]);

  const tableFilteredIncomeExpenseSummary = React.useMemo(() => {
    return summarizeIncomeExpense(filteredTransactions);
  }, [filteredTransactions]);

  const excludePaidBillsFromSum = filterType === 'conta';

  const tableNetSum = React.useMemo(
    () =>
      filteredTransactions.reduce((acc, tr) => {
        if (excludePaidBillsFromSum && isBillPaid(tr)) {
          return acc;
        }
        return acc + transactionSignedAmount(tr);
      }, 0),
    [excludePaidBillsFromSum, filteredTransactions]
  );

  const resolveDayGroupLabel = React.useCallback(
    (dateString: string) => {
      const date = parseLocalDateInput(dateString);
      if (!isValidDate(date)) return dateString;
      if (isToday(date)) return t('landing_v2.transactions.today');
      if (isYesterday(date)) return t('landing_v2.transactions.yesterday');
      return formatDate(dateString);
    },
    [formatDate, t]
  );

  const groupedByDay = React.useMemo((): TransactionDayGroup[] => {
    const map = new Map<string, Transaction[]>();

    filteredTransactions.forEach((tr) => {
      const dateKey = normalizeLocalDateString(tr.date) ?? tr.date;
      const list = map.get(dateKey) ?? [];
      list.push(tr);
      map.set(dateKey, list);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) =>
        effectiveFilters.tableSortColumn === "date"
          ? effectiveFilters.tableSortOrder === "asc"
            ? a.localeCompare(b)
            : b.localeCompare(a)
          : b.localeCompare(a)
      )
      .map(([dateKey, items]) => ({
        dateKey,
        label: resolveDayGroupLabel(items[0]?.date ?? dateKey),
        items:
          effectiveFilters.tableSortColumn === "date"
            ? items
            : [...items].sort((a, b) =>
                compareTransactionsByColumn(
                  a,
                  b,
                  effectiveFilters.tableSortColumn,
                  effectiveFilters.tableSortOrder,
                  sortFilterOptions
                )
              ),
      }));
  }, [
    effectiveFilters.tableSortColumn,
    effectiveFilters.tableSortOrder,
    filteredTransactions,
    resolveDayGroupLabel,
    sortFilterOptions,
  ]);

  const selectedMonthLabel = React.useMemo(() => {
    if (!selectedMonth) return '';
    return new Intl.DateTimeFormat(i18n.language, {
      month: 'long',
      year: 'numeric',
    }).format(parseMonthKey(selectedMonth));
  }, [i18n.language, selectedMonth]);

  const tableSumDisplay = React.useMemo(() => {
    if (formatCurrency) {
      const sign = tableNetSum >= 0 ? '+' : '-';
      return `${sign}${formatCurrency(Math.abs(tableNetSum))}`;
    }
    const sign = tableNetSum >= 0 ? '+' : '-';
    return `${sign}$${Math.abs(tableNetSum).toLocaleString()}`;
  }, [formatCurrency, tableNetSum]);

  const handleSheetOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      if (sheetDismissGuardRef.current.isActive()) return;
      setSheetOpen(false);
      setSheetEditId(null);
    }
  }, []);

  const openCreateSheet = React.useCallback((type: TransactionType) => {
    if (isReadOnly) return;
    sheetDismissGuardRef.current.mark();
    setSheetCreateType(type);
    setSheetEditId(null);
    setSheetOpen(true);
  }, [isReadOnly]);

  const openEditSheet = React.useCallback((transaction: Transaction) => {
    if (isReadOnly) return;
    if (!transaction.id) return;
    sheetDismissGuardRef.current.mark();
    setSheetEditId(transaction.id);
    setSheetEditType(transaction.type);
    setSheetOpen(true);
  }, [isReadOnly]);

  const openDeleteDialog = React.useCallback((transaction: Transaction) => {
    if (isReadOnly) return;
    deleteDismissGuardRef.current.mark();
    setSelectedTransaction(transaction);
  }, [isReadOnly]);

  const handleDeleteDialogOpenChange = React.useCallback((open: boolean) => {
    if (!open && deleteDismissGuardRef.current.isActive()) return;
    setSelectedTransaction((current) => (open ? current : undefined));
  }, []);

  const defaultCreateDate = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    if (!selectedMonth || !monthRange) return today;
    if (isCurrentMonthKey(selectedMonth)) return today;
    return monthRange.endDate;
  }, [monthRange, selectedMonth]);

  const defaultCreateType = React.useMemo((): TransactionType => {
    if (filterType === 'receita' || filterType === 'despesa' || filterType === 'conta') {
      return filterType;
    }
    return 'despesa';
  }, [filterType]);

  const clearInlineSession = React.useCallback(() => {
    setInlineSession(null);
  }, []);

  const openInlineCreate = React.useCallback(
    (type: TransactionType) => {
      if (isReadOnly) return;
      setInlineSession({
        mode: 'create',
        draft: createEmptyDraft(type, defaultCreateDate),
      });
    },
    [defaultCreateDate, isReadOnly]
  );

  const openInlineEdit = React.useCallback((transaction: Transaction) => {
    if (isReadOnly) return;
    if (!transaction.id) return;
    setInlineSession({
      mode: 'edit',
      transactionId: transaction.id,
      draft: draftFromTransaction(transaction, i18n.language),
    });
  }, [i18n.language, isReadOnly]);

  const toggleExpandedTransaction = React.useCallback((transactionId: string) => {
    setExpandedTransactionIds((prev) => {
      const next = new Set(prev);
      if (next.has(transactionId)) {
        next.delete(transactionId);
      } else {
        next.add(transactionId);
      }
      return next;
    });
  }, []);

  const openTableRowEdit = React.useCallback(
    (transaction: Transaction) => {
      if (!useInlineTable) {
        openEditSheet(transaction);
        return;
      }
      openInlineEdit(transaction);
    },
    [openEditSheet, openInlineEdit, useInlineTable]
  );

  const transactionsById = React.useMemo(
    () => new Map(filteredTransactions.map((tr) => [tr.id, tr])),
    [filteredTransactions]
  );

  React.useEffect(() => {
    if (!useInlineTable || !inlineSession) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (isInsideQuickAddNestedLayer(event.target)) return;

      const el = elementFromEventTarget(event.target);
      if (!el) return;

      if (el.closest(TRANSACTION_INLINE_ROW_SELECTOR)) return;
      if (el.closest(TRANSACTION_INSTALLMENT_ROW_SELECTOR)) return;

      const dataRow = el.closest(TRANSACTION_DATA_ROW_SELECTOR);
      if (dataRow) return;

      if (el.closest(TRANSACTION_ADD_ROW_SELECTOR)) {
        openInlineCreate(defaultCreateType);
        return;
      }

      clearInlineSession();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [
    useInlineTable,
    inlineSession,
    transactionsById,
    openInlineCreate,
    defaultCreateType,
    clearInlineSession,
  ]);

  React.useEffect(() => {
    if (!useInlineTable || !inlineSession) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (hasOpenInlineEditOverlay()) return;
      event.preventDefault();
      clearInlineSession();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [useInlineTable, inlineSession, clearInlineSession]);

  const onQuickAddSheetDismissIntercept = React.useCallback(
    (event: { preventDefault: () => void; target: EventTarget; detail?: { originalEvent?: Event } }) => {
      if (sheetDismissGuardRef.current.isActive()) {
        event.preventDefault();
        return;
      }
      preventQuickAddSheetDismissIfFromNestedPortal(event);
    },
    []
  );

  const handleToggleBillPaid = React.useCallback(
    (transaction: Transaction) => {
      if (isReadOnly) return;
      if (!transaction.id || transaction.type !== 'conta') return;
      const nextPaid = !isBillPaid(transaction);
      setTogglingPaidId(transaction.id);
      toggleBillPaid(
        { id: transaction.id, paid: nextPaid },
        {
          onSuccess: () => {
            refetch();
            setTogglingPaidId(null);
          },
          onError: () => {
            toast({
              title: t('transactionList.paidToggleError'),
              variant: 'destructive',
            });
            setTogglingPaidId(null);
          },
        }
      );
    },
    [isReadOnly, refetch, t, toggleBillPaid]
  );

  const handleTableSortClick = React.useCallback(
    (column: TransactionTableSortColumn) => {
      setTransactionListFilters((prev) => {
        if (prev.tableSortColumn === column) {
          return {
            ...prev,
            tableSortOrder: prev.tableSortOrder === "desc" ? "asc" : "desc",
          };
        }
        return {
          ...prev,
          tableSortColumn: column,
          tableSortOrder: getDefaultSortOrderForColumn(column),
        };
      });
    },
    [setTransactionListFilters]
  );

  const renderTableTransactionRows = () => {
    let rowIndex = 0;

    const renderTransactionRow = (transaction: Transaction) => {
        const currentRowIndex = rowIndex;
        rowIndex += 1;

        const isEditingRow =
          useInlineTable &&
          inlineSession?.mode === 'edit' &&
          inlineSession.transactionId === transaction.id;

        if (isEditingRow && inlineSession) {
          return (
            <TransactionTableInlineRow
              key={transaction.id}
              mode="edit"
              draft={inlineSession.draft}
              onDraftChange={(draft) =>
                setInlineSession((prev) =>
                  prev ? { ...prev, draft } : prev
                )
              }
              onCancel={clearInlineSession}
              onSaved={clearInlineSession}
              editTransactionId={transaction.id}
              allTransactions={displayTransactions || []}
              rowIndex={currentRowIndex}
              zebra={currentRowIndex % 2 === 1}
              showPaidColumn={showPaidColumn}
            />
          );
        }

        const CatIcon = getCategoryIcon(transaction.category);
        const isSplitTransaction = hasMultipleAllocations(transaction);
        const allocationCount = getAllocationCount(transaction);
        const splitVisual = getSplitAllocationVisual(allocationCount);
        const isExpanded =
          Boolean(transaction.id) && expandedTransactionIds.has(transaction.id!);
        const walletBadge = isSplitTransaction
          ? {
              name: t('transactionList.splitWallets', {
                defaultValue: '{{count}} carteiras',
                count: allocationCount,
              }),
              color: allocationCount >= 3 ? '#8b5cf6' : '#6366f1',
            }
          : getWalletBadgeData(transaction.walletId || transaction.cardId);
        const zebra = currentRowIndex % 2 === 1;
        const isBill = transaction.type === 'conta';
        const isBillPaidRow = isBillPaid(transaction);
        const isTogglingThisPaid =
          isTogglingPaid && togglingPaidId === transaction.id;

        const handleTableRowClick = () => {
          if (!isTableVariant) {
            openEditSheet(transaction);
            return;
          }
          if (isSplitTransaction && transaction.id) {
            toggleExpandedTransaction(transaction.id);
          }
        };

        const handleTableRowDoubleClick = () => {
          if (!isTableVariant) return;
          openTableRowEdit(transaction);
        };

        const rowContent = (
          <>
          <TableRow
            role={isTableVariant ? 'button' : 'button'}
            tabIndex={isTableVariant ? 0 : 0}
            className={cn(
              'border-0 transition-colors',
              isTableVariant && 'cursor-pointer select-none',
              isBill && !isBillPaidRow && 'border-l-2 border-l-amber-500/50',
              isBill && isBillPaidRow && 'opacity-60',
              zebra
                ? 'bg-muted/30 hover:bg-muted/45 dark:bg-muted/15 dark:hover:bg-muted/25'
                : 'bg-transparent hover:bg-muted/25 dark:hover:bg-muted/20',
              isPendingTransaction(transaction.id) && 'pointer-events-none opacity-60',
              isTogglingThisPaid && 'pointer-events-none opacity-70',
              useInlineTable &&
                inlineSession &&
                inlineSession.mode === 'edit' &&
                inlineSession.transactionId !== transaction.id &&
                'opacity-50',
              isSplitTransaction && isExpanded && 'bg-muted/40 dark:bg-muted/20'
            )}
            data-transaction-row-id={isTableVariant ? transaction.id : undefined}
            onClick={handleTableRowClick}
            onDoubleClick={handleTableRowDoubleClick}
            onKeyDown={(e) => {
              if (!isTableVariant) {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openEditSheet(transaction);
                }
                return;
              }
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (isSplitTransaction && transaction.id) {
                  toggleExpandedTransaction(transaction.id);
                } else {
                  openTableRowEdit(transaction);
                }
              }
            }}
          >
            <TableCell className="border-b border-border/30 py-2 pl-4 pr-2 align-middle">
              <div className="flex items-center gap-2.5">
                {isSplitTransaction && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </span>
                )}
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                    transaction.type === 'receita'
                      ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                      : transaction.type === 'conta'
                        ? 'bg-amber-500/12 text-amber-600 dark:text-amber-400'
                        : 'bg-red-500/12 text-red-600 dark:text-red-400'
                  )}
                >
                  {transaction.type === 'receita' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : transaction.type === 'conta' ? (
                    <Receipt className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </span>
                <span
                  className={cn(
                    'text-sm font-medium leading-snug line-clamp-2 text-foreground',
                    isBill && isBillPaidRow && 'line-through'
                  )}
                >
                  {transaction.description}
                </span>
                {isSplitTransaction && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'h-5 shrink-0 px-1.5 text-[10px] font-semibold',
                      splitVisual.badge
                    )}
                  >
                    {allocationCount}x
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="border-b border-border/30 py-2 px-3 align-middle">
              <Badge variant="secondary" className="h-6 max-w-[180px] gap-1.5 px-2 py-0 text-xs font-normal">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-border/50"
                  style={{ backgroundColor: walletBadge.color }}
                  aria-hidden
                />
                <span className="truncate">{walletBadge.name}</span>
              </Badge>
            </TableCell>
            <TableCell className="border-b border-border/30 py-2 px-3 align-middle text-sm text-muted-foreground whitespace-nowrap">
              {formatTableDate(transaction.date)}
            </TableCell>
            <TableCell className="border-b border-border/30 py-2 px-3 align-middle">
              <Badge variant="secondary" className="h-6 gap-1.5 px-2 py-0 text-xs font-normal">
                {CatIcon && <CatIcon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />}
                {getCategoryLabel(transaction.category)}
              </Badge>
            </TableCell>
            <TableCell className="border-b border-border/30 py-2 px-3 align-middle">
              <Badge
                variant="secondary"
                className={cn(
                  'h-6 border-0 px-2 py-0 text-xs font-medium',
                  transaction.type === 'receita'
                    ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
                    : transaction.type === 'conta'
                      ? 'bg-amber-500/12 text-amber-700 dark:text-amber-400'
                      : 'bg-red-500/12 text-red-700 dark:text-red-400'
                )}
              >
                {transaction.type === 'receita'
                  ? t('landing_v2.transactions.income')
                  : transaction.type === 'conta'
                    ? t('sidebar.bills')
                    : t('landing_v2.transactions.expense')}
              </Badge>
            </TableCell>
            {showPaidColumn && (
              <TableCell
                className="border-b border-border/30 py-2 px-3 align-middle text-center"
                onClick={(e) => e.stopPropagation()}
              >
                {isBill && (
                  <Checkbox
                    checked={isBillPaidRow}
                    disabled={isTogglingThisPaid || isReadOnly}
                    onCheckedChange={() => handleToggleBillPaid(transaction)}
                    aria-label={t('transactionList.paid')}
                  />
                )}
              </TableCell>
            )}
            <TableCell
              className={cn(
                'border-b border-border/30 py-2 px-3 text-right align-middle font-mono text-sm font-semibold tabular-nums whitespace-nowrap',
                transaction.type === 'receita'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : transaction.type === 'conta'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
              )}
            >
              {formatAmount(transaction.value, transaction.type)}
            </TableCell>
            <TableCell
              className="border-b border-border/30 py-2 pr-4 pl-2 text-right align-middle"
              onClick={(e) => e.stopPropagation()}
            >
              {useInlineTable ? (
                <TransactionRowActionsDropdown
                  onEdit={() => openTableRowEdit(transaction)}
                  onDelete={() => openDeleteDialog(transaction)}
                />
              ) : (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="select-none">
                      {t('transactionList.actions')}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) =>
                        deferDropdownMenuAction(event, () => openDeleteDialog(transaction))
                      }
                    >
                      <div className="flex flex-row items-center gap-2">
                        <Trash className="h-4 w-4" /> {t('transactionList.delete')}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex flex-row items-center gap-2"
                      onSelect={(event) =>
                        deferDropdownMenuAction(event, () => openEditSheet(transaction))
                      }
                    >
                      <Pen className="h-4 w-4" /> {t('transactionList.edit')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          </TableRow>
          {isSplitTransaction &&
            isExpanded &&
            resolveAllocations(transaction).map((allocation, allocationIndex) => {
              const installmentWallet = getWalletBadgeData(allocation.walletId);
              return (
                <TableRow
                  key={`${transaction.id}-installment-${allocationIndex}`}
                  data-transaction-installment-row
                  className="border-0 bg-muted/20 hover:bg-muted/30 dark:bg-muted/10"
                >
                  <TableCell
                    className={cn(
                      'border-b border-border/20 border-l-2 py-1.5 pl-12 pr-2 align-middle',
                      splitVisual.rowBorder[allocationIndex] ?? 'border-l-border'
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          allocationCount >= 3
                            ? ['bg-violet-500', 'bg-fuchsia-500', 'bg-purple-500'][
                                allocationIndex
                              ]
                            : ['bg-indigo-500', 'bg-sky-500'][allocationIndex] ?? 'bg-border'
                        )}
                      />
                      <span>
                        {t('transactionList.installment', {
                          defaultValue: 'Parcela {{index}}',
                          index: allocationIndex + 1,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="border-b border-border/20 py-1.5 px-3 align-middle">
                    <Badge
                      variant="secondary"
                      className="h-6 max-w-[180px] gap-1.5 px-2 py-0 text-xs font-normal"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full border border-border/50"
                        style={{ backgroundColor: installmentWallet.color }}
                        aria-hidden
                      />
                      <span className="truncate">{installmentWallet.name}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="border-b border-border/20 py-1.5 px-3" />
                  <TableCell className="border-b border-border/20 py-1.5 px-3" />
                  <TableCell className="border-b border-border/20 py-1.5 px-3" />
                  {showPaidColumn && <TableCell className="border-b border-border/20 py-1.5 px-3" />}
                  <TableCell
                    className={cn(
                      'border-b border-border/20 py-1.5 px-3 text-right align-middle font-mono text-xs font-semibold tabular-nums whitespace-nowrap',
                      transaction.type === 'receita'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : transaction.type === 'conta'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {formatAmount(allocation.amount, transaction.type)}
                  </TableCell>
                  <TableCell className="border-b border-border/20 py-1.5 pr-4" />
                </TableRow>
              );
            })}
          </>
        );

        if (useInlineTable) {
          return (
            <TransactionRowActionsMenu
              key={transaction.id}
              onEdit={() => openTableRowEdit(transaction)}
              onDelete={() => openDeleteDialog(transaction)}
            >
              {rowContent}
            </TransactionRowActionsMenu>
          );
        }

        return <React.Fragment key={transaction.id}>{rowContent}</React.Fragment>;
    };

    if (effectiveFilters.tableSortColumn !== "date") {
      return filteredTransactions.map((transaction) => renderTransactionRow(transaction));
    }

    return groupedByDay.flatMap((group) => {
      const daySeparatorRow = (
        <TableRow
          key={`day-separator-${group.dateKey}`}
          className="border-0 hover:bg-transparent bg-muted/25 dark:bg-muted/10"
        >
          <TableCell
            colSpan={tableColumnCount}
            className="border-b border-border/40 py-2 pl-4 pr-4 text-xs font-semibold tracking-wide text-muted-foreground"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="capitalize text-base">{group.label}</span>
              <span className="text-[11px] font-medium tabular-nums text-muted-foreground/80">
                {group.items.length}
              </span>
            </div>
          </TableCell>
        </TableRow>
      );

      const transactionRows = group.items.map((transaction) =>
        renderTransactionRow(transaction)
      );

      return [daySeparatorRow, ...transactionRows];
    });
  };

  return (
    <>
      <Card className={cn("glass-card", variant === 'table' && "rounded-xl border-border/60")}>
        <CardHeader>
          {variant === 'table' && showQuickAdd && (
            <div
              aria-label={t('dashboard.monthFilter.label')}
              className={cn(
                'grid grid-cols-1 gap-2 mb-3',
                filterType === 'conta'
                  ? 'md:grid-cols-1'
                  : filterType === 'Todos'
                    ? 'md:grid-cols-3'
                    : 'md:grid-cols-2'
              )}
            >
              {(filterType === 'Todos' || filterType === 'receita') && (
                <div className="group relative overflow-hidden rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground">{t('sidebar.income')}</p>
                      <p className="truncate text-base font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatSummaryValue(tableFilteredSummary.incomeTotal)}
                      </p>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Badge className="h-5 border-0 bg-emerald-500/15 px-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      {tableFilteredSummary.incomeCount}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {t('filters.items', { defaultValue: 'transações' })}
                    </span>
                  </div>
                </div>
              )}
              {(filterType === 'Todos' || filterType === 'despesa') && (
                <div className="group relative overflow-hidden rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground">{t('sidebar.expenses')}</p>
                      <p className="truncate text-base font-semibold text-red-600 dark:text-red-400">
                        {formatSummaryValue(tableFilteredSummary.expenseTotal)}
                      </p>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                      <TrendingDown className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Badge className="h-5 border-0 bg-red-500/15 px-1.5 text-[11px] font-semibold text-red-700 dark:text-red-300">
                      {tableFilteredSummary.expenseCount}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {t('filters.items', { defaultValue: 'transações' })}
                    </span>
                  </div>
                </div>
              )}
              {(filterType === 'Todos' || filterType === 'conta') && (
                <div className="group relative overflow-hidden rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-medium text-muted-foreground">{t('sidebar.bills')}</p>
                      <p className="truncate text-base font-semibold text-amber-600 dark:text-amber-400">
                        {formatSummaryValue(
                          filterType === 'conta'
                            ? tableFilteredSummary.billsPendingTotal
                            : tableFilteredSummary.billsTotal
                        )}
                      </p>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                      <Receipt className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge className="h-5 border-0 bg-amber-500/15 px-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                      {tableFilteredSummary.billsCount}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {t('filters.items', { defaultValue: 'transações' })}
                    </span>
                    {filterType === 'conta' && (
                      <span className="text-[11px] text-muted-foreground">
                        · {tableFilteredSummary.billsPaidCount}/{tableFilteredSummary.billsCount} {t('transactionList.paid').toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className={cn("font-semibold", variant === 'table' ? "text-base md:text-lg tracking-tight" : "text-lg")}>
              {title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {variant === 'table' && showQuickAdd && (
                <>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    disabled={isReadOnly}
                    onClick={() => openInlineCreate('receita')}
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    {t('dashboard.actions.receipt')}
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-red-600 text-white hover:bg-red-700 shadow-sm"
                    disabled={isReadOnly}
                    onClick={() => openInlineCreate('despesa')}
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    {t('dashboard.actions.expense')}
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
                    disabled={isReadOnly}
                    onClick={() => openInlineCreate('conta')}
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    {t('dashboard.actions.bill')}
                  </Button>
                </>
              )}
            <TransactionFiltersDialog
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              filters={{
                card: filterCard,
                categories: filterCategories,
                type: filterType,
                minValue,
                maxValue,
                startDate,
                endDate,
                tableSortColumn,
                tableSortOrder,
              }}
              filteredCount={filteredTransactions.length}
              onClearAll={handleFiltersClearAll}
              onChange={(key, value: string | string[]) => {
                setTransactionListFilters((prev) => {
                  switch (key) {
                    case 'card':
                      return { ...prev, card: value as string };
                    case 'categories':
                      return { ...prev, categories: value as string[] };
                    case 'type':
                      return { ...prev, type: value as string };
                    case 'minValue':
                      return { ...prev, minValue: value as string };
                    case 'maxValue':
                      return { ...prev, maxValue: value as string };
                    case 'startDate':
                      return {
                        ...prev,
                        startDate: value as string,
                        dateRangeLockedToMonth: false,
                      };
                    case 'endDate':
                      return {
                        ...prev,
                        endDate: value as string,
                        dateRangeLockedToMonth: false,
                      };
                    case 'tableSortColumn':
                      return {
                        ...prev,
                        tableSortColumn: value as TransactionTableSortColumn,
                      };
                    case 'tableSortOrder':
                      return {
                        ...prev,
                        tableSortOrder: value as 'asc' | 'desc',
                      };
                    default:
                      return prev;
                  }
                });
              }}
            />
            </div>
          </div>          
          {selectedMonth && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {t('dashboard.monthFilter.label')}:{" "}
                <Badge className='rounded-sm shadow select-none hover:bg-primary/70'>
                  <span className="font-medium capitalize">{selectedMonthLabel}</span>
                </Badge>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handlePreviousMonthClick}
                  aria-label={t('dashboard.monthFilter.previous')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetCurrentMonthClick}
                  disabled={isCurrentMonthKey(selectedMonth)}
                >
                  {t('dashboard.monthFilter.current')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleNextMonthClick}
                  aria-label={t('dashboard.monthFilter.next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn(
            "flex items-center justify-between",
            variant === 'table' && "border-b border-border/40 pb-3 -mx-6 px-6"
          )}>
            <ToggleGroup
              type="single"
              value={filterType}
              onValueChange={(v) =>
                v &&
                setTransactionListFilters((prev) => ({ ...prev, type: v }))
              }
              variant="outline"
              size="sm"
              className={cn("flex-wrap gap-2", variant === 'table' && "gap-1.5")}
            >
              <ToggleGroupItem value="Todos" aria-label="Todos">
                {t('default.all') || 'Todos'}
              </ToggleGroupItem>
              <ToggleGroupItem value="receita" aria-label="Receitas" className="data-[state=on]:bg-emerald-500/10">
                <TrendingUp className="w-4 h-4 mr-1 text-emerald-400" /> {t('landing_v2.transactions.income')}
              </ToggleGroupItem>
              <ToggleGroupItem value="despesa" aria-label="Despesas" className="data-[state=on]:bg-red-500/10">
                <TrendingDown className="w-4 h-4 mr-1 text-red-400" /> {t('landing_v2.transactions.expense')}
              </ToggleGroupItem>
              <ToggleGroupItem value="conta" aria-label="Contas" className="data-[state=on]:bg-amber-500/10">
                <Receipt className="w-4 h-4 mr-1 text-amber-400" /> {t('sidebar.bills')}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>          
          {isLoading ? (
            <div className='flex items-center justify-center flex-col gap-2'>
              <Loader2 className='animate-spin' />
              <span className="text-muted-foreground text-sm select-none">{t('transactionList.loading')}</span>
            </div>
          ) : variant === 'table' ? (
            <ScrollArea
              className={cn(
                'rounded-lg border border-border/40 bg-card/30 shadow-sm',
                scrollClassName || 'h-[min(78vh,760px)]'
              )}
            >
              {!useInlineTable && filteredTransactions?.length === 0 ? (
                <p className="text-muted-foreground text-center py-12 px-4 text-sm">
                  {t('transactionList.empty')}
                </p>
              ) : (
                <Table
                  containerClassName="overflow-visible"
                  className="border-separate border-spacing-0 text-sm"
                >
                  <TableHeader>
                    <TableRow className="border-0 hover:bg-transparent">
                      <SortableTableHead
                        column="description"
                        label={t('transactionList.table.description')}
                        activeColumn={tableSortColumn}
                        sortOrder={tableSortOrder}
                        onSort={handleTableSortClick}
                        className={cn(TABLE_HEAD_CLASS, "min-w-[160px] w-[28%] pl-4 pr-2")}
                      />
                      <SortableTableHead
                        column="wallet"
                        label={t('transactionList.table.wallet')}
                        activeColumn={tableSortColumn}
                        sortOrder={tableSortOrder}
                        onSort={handleTableSortClick}
                        className={cn(TABLE_HEAD_CLASS, "w-[22%] px-3")}
                      />
                      <SortableTableHead
                        column="date"
                        label={t('transactionList.table.date')}
                        activeColumn={tableSortColumn}
                        sortOrder={tableSortOrder}
                        onSort={handleTableSortClick}
                        className={cn(TABLE_HEAD_CLASS, "w-[22%] px-3")}
                      />
                      <SortableTableHead
                        column="category"
                        label={t('transactionList.table.category')}
                        activeColumn={tableSortColumn}
                        sortOrder={tableSortOrder}
                        onSort={handleTableSortClick}
                        className={cn(TABLE_HEAD_CLASS, "w-[18%] px-3")}
                      />
                      <SortableTableHead
                        column="type"
                        label={t('transactionList.table.type')}
                        activeColumn={tableSortColumn}
                        sortOrder={tableSortOrder}
                        onSort={handleTableSortClick}
                        className={cn(TABLE_HEAD_CLASS, "w-[14%] px-3")}
                      />
                      {showPaidColumn && (
                        <SortableTableHead
                          column="paid"
                          label={t('transactionList.paid')}
                          activeColumn={tableSortColumn}
                          sortOrder={tableSortOrder}
                          onSort={handleTableSortClick}
                          align="center"
                          className={cn(TABLE_HEAD_CLASS, "w-[8%] px-3 text-center")}
                        />
                      )}
                      <SortableTableHead
                        column="value"
                        label={t('transactionList.table.value')}
                        activeColumn={tableSortColumn}
                        sortOrder={tableSortOrder}
                        onSort={handleTableSortClick}
                        align="right"
                        className={cn(TABLE_HEAD_CLASS, "w-[18%] min-w-[140px] px-3 text-right")}
                      />
                      <TableHead className={cn(TABLE_HEAD_CLASS, "w-12 pl-2 pr-4 text-right")}>
                        <span className="sr-only">{t('transactionList.actions')}</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTableTransactionRows()}
                    {useInlineTable &&
                      (inlineSession?.mode === 'create' ? (
                        <TransactionTableInlineRow
                          key="inline-create"
                          mode="create"
                          draft={inlineSession.draft}
                          onDraftChange={(draft) =>
                            setInlineSession((prev) =>
                              prev ? { ...prev, draft } : prev
                            )
                          }
                          onCancel={clearInlineSession}
                          onSaved={clearInlineSession}
                          allTransactions={displayTransactions || []}
                          zebra={filteredTransactions.length % 2 === 1}
                          showPaidColumn={showPaidColumn}
                        />
                      ) : (
                        <TableRow
                          role="button"
                          tabIndex={0}
                          data-transaction-add-row
                          className={cn(
                            'border-0 cursor-pointer border-dashed hover:bg-muted/30 dark:hover:bg-muted/15',
                            inlineSession?.mode === 'edit' && 'opacity-50'
                          )}
                          onClick={() => openInlineCreate(defaultCreateType)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openInlineCreate(defaultCreateType);
                            }
                          }}
                        >
                          <TableCell
                            colSpan={tableColumnCount}
                            className="border-b border-border/30 py-3 pl-4 text-sm text-muted-foreground"
                          >
                            <span className="flex items-center gap-2">
                              <Plus className="h-4 w-4 shrink-0 opacity-70" />
                              {t('transactionList.inline.addPlaceholder')}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                  <TableFooter className="border-0 bg-transparent">
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell
                        colSpan={showPaidColumn ? 6 : 5}
                        className="sticky bottom-0 z-10 border-t border-border/50 bg-muted py-2.5 pl-4 pr-2 text-sm font-semibold text-muted-foreground shadow-[0_-1px_0_0_hsl(var(--border)/0.35)]"
                      >
                        {t('transactionList.table.sum')}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'sticky bottom-0 z-10 border-t border-border/50 bg-muted py-2.5 px-3 text-right align-middle font-mono text-sm font-bold tabular-nums shadow-[0_-1px_0_0_hsl(var(--border)/0.35)]',
                          tableNetSum >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {tableSumDisplay}
                      </TableCell>
                      <TableCell className="sticky bottom-0 z-10 border-t border-border/50 bg-muted py-2.5 pr-4 pl-2 shadow-[0_-1px_0_0_hsl(var(--border)/0.35)]" />
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </ScrollArea>
          ) : (
            <ScrollArea className={scrollClassName}>
              {filteredTransactions?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t('transactionList.empty')}
                </p>
              ) : (
                groupedByDay.map((group) => (
                  <div key={group.dateKey} className="mb-3">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-xs font-semibold capitalize text-muted-foreground">{group.label}</p>
                      <span className="text-[11px] tabular-nums text-muted-foreground/80">{group.items.length}</span>
                    </div>
                    {group.items.map((transaction) => (
                      <div
                        key={transaction.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border bg-background/50 shadow-sm hover:shadow-md transition-all mb-2",
                          isPendingTransaction(transaction.id) && "pointer-events-none animate-pulse"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              transaction.type === 'receita'
                                ? "bg-emerald-500/10"
                                : transaction.type === 'conta'
                                  ? "bg-amber-500/10"
                                  : "bg-red-500/10"
                            )}
                          >
                            {transaction.type === 'receita' ? (
                              <TrendingUp className="w-5 h-5 text-emerald-500" />
                            ) : transaction.type === 'conta' ? (
                              <Receipt className="w-5 h-5 text-amber-500" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium leading-tight">{transaction.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs gap-1.5">
                                {(() => {
                                  const Icon = getCategoryIcon(transaction.category);
                                  return (
                                    <>
                                      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />}
                                      <span>{getCategoryLabel(transaction.category)}</span>
                                    </>
                                  );
                                })()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(transaction.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "font-semibold text-right min-w-[88px]",
                              transaction.type === 'receita'
                                ? "text-emerald-500"
                                : transaction.type === 'conta'
                                  ? "text-amber-500"
                                  : "text-red-500"
                            )}
                          >
                            {formatAmount(transaction.value, transaction.type)}
                          </div>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button size='icon' variant='ghost'>
                                <EllipsisVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel className='select-none'>{t('transactionList.actions')}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={(event) =>
                                  deferDropdownMenuAction(event, () => openDeleteDialog(transaction))
                                }
                              >
                                <div className='flex flex-row items-center gap-2'>
                                  <Trash className='h-4 w-4' /> {t('transactionList.delete')}
                                </div>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='flex flex-row items-center gap-2'
                                onSelect={(event) =>
                                  deferDropdownMenuAction(event, () => openEditSheet(transaction))
                                }
                              >
                                <Pen className='h-4 w-4' /> {t('transactionList.edit')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}

            </ScrollArea>
          )}
        </CardContent>
      </Card>
      {selectedTransaction && (
        <DeleteDialog
          open={!!selectedTransaction}
          onOpenChange={handleDeleteDialogOpenChange}
          deleteFunction={() => handleDelete(selectedTransaction!.id!)}
          title={t('dialog.deleteTitle')}
          description={t('dialog.deleteDescription')}
          itemDetails={selectedTransaction!}
        />
      )}
      {!useInlineTable && sheetOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-[45] bg-black/30 dark:bg-black/40"
          onPointerDown={() => {
            if (sheetDismissGuardRef.current.isActive()) return;
            handleSheetOpenChange(false);
          }}
        />
      )}
      {!useInlineTable && (
      <Sheet modal={false} open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          className="z-[50] flex h-svh max-h-svh w-full max-w-[min(100vw,28rem)] flex-col gap-0 overflow-hidden p-0 sm:w-[28rem]"
          onPointerDownOutside={onQuickAddSheetDismissIntercept}
          onInteractOutside={onQuickAddSheetDismissIntercept}
        >
          <SheetHeader className="shrink-0 space-y-1 border-b border-border/50 px-6 pb-4 pt-6 text-left">
            <SheetTitle>
              {sheetEditId
                ? `${t('default.edit')} ${sheetEditType === 'receita' ? t('default.receipt') : sheetEditType === 'conta' ? t('default.bill') : t('default.expense')}`
                : `${t('default.add')} ${sheetCreateType === 'receita' ? t('default.receipt') : sheetCreateType === 'conta' ? t('default.bill') : t('default.expense')}`}
            </SheetTitle>
            <SheetDescription>
              {t('transactionList.allHistory')}
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
            <TransactionForm
              key={sheetEditId ?? `create-${sheetCreateType}`}
              type={sheetEditId ? sheetEditType : sheetCreateType}
              transactionId={sheetEditId ?? undefined}
              mode="sheet"
              onSuccess={() => handleSheetOpenChange(false)}
              onCancel={() => handleSheetOpenChange(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
      )}
    </>
  );
};

export default TransactionList;
