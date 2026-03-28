import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Loader2, EllipsisVertical, Trash, Pen, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction, useDeleteTransaction, useUserTransactions } from '@/utils/services/api/transation';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import DeleteDialog from './DeleteDialog';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { ScrollArea } from './ui/scroll-area';
import useUserStore from '@/store/UserStore';
import { useTranslation } from 'react-i18next';
import TransactionFiltersDialog from './TransactionFiltersDialog';
import TransactionForm from './TransactionForm';
import { useCategories } from '@/hooks/use-categories';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { getMonthRangeByKey, isCurrentMonthKey, parseLocalDateInput, parseMonthKey } from '@/subdomains/dashboard/utils/month-range';
import { transactionSignedAmount } from '@/subdomains/dashboard/utils/transaction-month-nets';
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

type TransactionTableMonthSummary = {
  incomeTotal: number
  expenseTotal: number
  incomeCount: number
  expenseCount: number
}

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  isLoading: boolean
  limit?: number
  scrollClassName?: string
  selectedMonth?: string
  onSelectedMonthChange?: (monthKey: string) => void
  onPreviousMonth?: () => void
  onNextMonth?: () => void
  onResetCurrentMonth?: () => void
  /** `table`: visão estilo planilha (desktop). */
  variant?: 'list' | 'table'
  formatCurrency?: (value: number) => string
  showQuickAdd?: boolean
  tableMonthSummary?: TransactionTableMonthSummary
}

const TransactionList = ({
  transactions,
  title = "Transações Recentes",
  isLoading,
  limit,
  scrollClassName = 'max-h-[350px] overflow-auto',
  selectedMonth,
  onSelectedMonthChange,
  onPreviousMonth,
  onNextMonth,
  onResetCurrentMonth,
  variant = 'list',
  formatCurrency,
  showQuickAdd = false,
  tableMonthSummary,
}: TransactionListProps) => {
  const displayTransactions = limit ? transactions?.slice(0, limit) : transactions;
  const { uid } = useUserStore();
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction>()
  const { mutate, isPending } = useDeleteTransaction()
  const { refetch } = useUserTransactions()
  const { t, i18n } = useTranslation();
  const { getCategoryIcon } = useCategories();

  const [filterCard, setFilterCard] = React.useState<string>('Todos');
  const [filterCategories, setFilterCategories] = React.useState<string[]>(['Todos']);
  const [filterType, setFilterType] = React.useState<string>('Todos');
  const [minValue, setMinValue] = React.useState<string>('');
  const [maxValue, setMaxValue] = React.useState<string>('');
  const [quickAddOpen, setQuickAddOpen] = React.useState<boolean>(false);
  const [quickAddType, setQuickAddType] = React.useState<'receita' | 'despesa'>('receita');
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(false);
  const monthRange = React.useMemo(
    () => (selectedMonth ? getMonthRangeByKey(selectedMonth) : undefined),
    [selectedMonth]
  );

  React.useEffect(() => {
    if (!monthRange) return;
    setStartDate(monthRange.startDate);
    setEndDate(monthRange.endDate);
  }, [monthRange]);


  const formatAmount = (amount: number, type: 'receita' | 'despesa') => {
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
    return date.toLocaleDateString(i18n.language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDate = (dateString: string) => {
    const date = parseLocalDateInput(dateString);
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

  const isIncome = (type: string) => {
    switch (type) {
      case 'receita':
        return 'income'
      case 'despesa':
        return 'expenses'
    }
  }

  const getCategoryLabel = (category: string) => t(`categories.${category}`);


  const filteredTransactions = React.useMemo(() => {
    const min = minValue ? parseFloat(minValue) : undefined;
    const max = maxValue ? parseFloat(maxValue) : undefined;
    const start = startDate ? parseLocalDateInput(startDate) : undefined;
    const end = endDate ? parseLocalDateInput(endDate) : undefined;

    return (displayTransactions || []).filter((tr) => {
      const trDate = parseLocalDateInput(tr.date);
      const trCard = tr.cardId || 'no_card';

      const matchCard = filterCard === 'Todos' ? true : trCard === filterCard;
      const matchCategory =
        filterCategories.includes('Todos') ? true : filterCategories.includes(tr.category);
      const matchType = filterType === 'Todos' ? true : tr.type === filterType;
      const matchMin = min !== undefined ? tr.value >= min : true;
      const matchMax = max !== undefined ? tr.value <= max : true;
      const matchStart = start ? trDate >= start : true;
      const matchEnd = end ? trDate <= end : true;

      return matchCard && matchCategory && matchType && matchMin && matchMax && matchStart && matchEnd;
    }).sort((a, b) => parseLocalDateInput(b.date).getTime() - parseLocalDateInput(a.date).getTime());
  }, [displayTransactions, filterCard, filterCategories, filterType, minValue, maxValue, startDate, endDate]);

  const tableNetSum = React.useMemo(
    () => filteredTransactions.reduce((acc, tr) => acc + transactionSignedAmount(tr), 0),
    [filteredTransactions]
  );

  const groupedByDay = React.useMemo(() => {
    const groups: { label: string; items: Transaction[] }[] = [];
    const map = new Map<string, Transaction[]>();

    filteredTransactions.forEach((tr) => {
      const d = parseLocalDateInput(tr.date);
      let label = formatDate(tr.date);
      if (isToday(d)) label = t('landing_v2.transactions.today');
      else if (isYesterday(d)) label = t('landing_v2.transactions.yesterday');

      const list = map.get(label) || [];
      list.push(tr);
      map.set(label, list);
    });

    map.forEach((items, label) => {
      groups.push({ label, items });
    });

    return groups;
  }, [filteredTransactions, i18n.language, t, formatDate]);

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

  const openQuickAdd = React.useCallback((type: 'receita' | 'despesa') => {
    setQuickAddType(type);
    setQuickAddOpen(true);
  }, []);

  return (
    <>
      <Card className={cn("glass-card", variant === 'table' && "rounded-xl border-border/60")}>
        <CardHeader>
          {variant === 'table' && tableMonthSummary && (
            <div
              aria-label={t('dashboard.monthFilter.label')}
              className="grid grid-cols-1 gap-2 md:grid-cols-2 mb-3"
            >
              <div className="group relative overflow-hidden rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground">{t('sidebar.income')}</p>
                    <p className="truncate text-base font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatSummaryValue(tableMonthSummary.incomeTotal)}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge className="h-5 border-0 bg-emerald-500/15 px-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    {tableMonthSummary.incomeCount}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {t('filters.items', { defaultValue: 'transações' })}
                  </span>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground">{t('sidebar.expenses')}</p>
                    <p className="truncate text-base font-semibold text-red-600 dark:text-red-400">
                      {formatSummaryValue(tableMonthSummary.expenseTotal)}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                    <TrendingDown className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge className="h-5 border-0 bg-red-500/15 px-1.5 text-[11px] font-semibold text-red-700 dark:text-red-300">
                    {tableMonthSummary.expenseCount}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {t('filters.items', { defaultValue: 'transações' })}
                  </span>
                </div>
              </div>
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
                    onClick={() => openQuickAdd('receita')}
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    {t('dashboard.actions.receipt')}
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-red-600 text-white hover:bg-red-700 shadow-sm"
                    onClick={() => openQuickAdd('despesa')}
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    {t('dashboard.actions.expense')}
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
              }}
              filteredCount={filteredTransactions.length}
              onChange={(key, value: string | string[]) => {
                switch (key) {
                  case 'card':
                    setFilterCard(value as string); break;
                  case 'categories':
                    setFilterCategories(value as string[]); break;
                  case 'type':
                    setFilterType(value as string); break;
                  case 'minValue':
                    setMinValue(value as string); break;
                  case 'maxValue':
                    setMaxValue(value as string); break;
                  case 'startDate': {
                    const nextValue = value as string;
                    setStartDate(nextValue);
                    if (selectedMonth && onSelectedMonthChange && nextValue.length >= 7) {
                      onSelectedMonthChange(nextValue.slice(0, 7));
                    }
                    break;
                  }
                  case 'endDate': {
                    const nextValue = value as string;
                    setEndDate(nextValue);
                    if (selectedMonth && onSelectedMonthChange && nextValue.length >= 7) {
                      onSelectedMonthChange(nextValue.slice(0, 7));
                    }
                    break;
                  }
                }
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
                  onClick={onPreviousMonth}
                  aria-label={t('dashboard.monthFilter.previous')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onResetCurrentMonth}
                  disabled={isCurrentMonthKey(selectedMonth)}
                >
                  {t('dashboard.monthFilter.current')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onNextMonth}
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
              onValueChange={(v) => v && setFilterType(v)}
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
              {filteredTransactions?.length === 0 ? (
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
                      <TableHead className="sticky top-0 z-20 h-11 min-w-[160px] w-[28%] border-b border-border/50 bg-background py-2.5 pl-4 pr-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border)/0.4)]">
                        {t('transactionList.table.description')}
                      </TableHead>
                      <TableHead className="sticky top-0 z-20 h-11 w-[22%] border-b border-border/50 bg-background py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border)/0.4)]">
                        {t('transactionList.table.date')}
                      </TableHead>
                      <TableHead className="sticky top-0 z-20 h-11 w-[18%] border-b border-border/50 bg-background py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border)/0.4)]">
                        {t('transactionList.table.category')}
                      </TableHead>
                      <TableHead className="sticky top-0 z-20 h-11 w-[14%] border-b border-border/50 bg-background py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border)/0.4)]">
                        {t('transactionList.table.type')}
                      </TableHead>
                      <TableHead className="sticky top-0 z-20 h-11 w-[14%] border-b border-border/50 bg-background py-2.5 px-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border)/0.4)]">
                        {t('transactionList.table.value')}
                      </TableHead>
                      <TableHead className="sticky top-0 z-20 h-11 w-12 border-b border-border/50 bg-background py-2.5 pl-2 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-[0_1px_0_0_hsl(var(--border)/0.4)]">
                        <span className="sr-only">{t('transactionList.actions')}</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction, rowIndex) => {
                      const CatIcon = getCategoryIcon(transaction.category);
                      const zebra = rowIndex % 2 === 1;
                      return (
                        <TableRow
                          key={transaction.id}
                          className={cn(
                            "border-0 transition-colors",
                            zebra ? "bg-muted/30 hover:bg-muted/45 dark:bg-muted/15 dark:hover:bg-muted/25" : "bg-transparent hover:bg-muted/25 dark:hover:bg-muted/20",
                            isPendingTransaction(transaction.id) && "pointer-events-none opacity-60"
                          )}
                        >
                          <TableCell className="border-b border-border/30 py-2 pl-4 pr-2 align-middle">
                            <div className="flex items-center gap-2.5">
                              <span className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                                transaction.type === 'receita' ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400" : "bg-red-500/12 text-red-600 dark:text-red-400"
                              )}>
                                {transaction.type === 'receita' ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                              </span>
                              <span className="text-sm font-medium leading-snug line-clamp-2 text-foreground">{transaction.description}</span>
                            </div>
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
                                "h-6 border-0 px-2 py-0 text-xs font-medium",
                                transaction.type === 'receita'
                                  ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
                                  : "bg-red-500/12 text-red-700 dark:text-red-400"
                              )}
                            >
                              {transaction.type === 'receita'
                                ? t('landing_v2.transactions.income')
                                : t('landing_v2.transactions.expense')}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn(
                            "border-b border-border/30 py-2 px-3 text-right align-middle font-mono text-sm font-semibold tabular-nums",
                            transaction.type === 'receita' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          )}>
                            {formatAmount(transaction.value, transaction.type)}
                          </TableCell>
                          <TableCell className="border-b border-border/30 py-2 pr-4 pl-2 text-right align-middle">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <EllipsisVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel className='select-none'>{t('transactionList.actions')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSelectedTransaction(transaction)}>
                                  <div className='flex flex-row items-center gap-2'>
                                    <Trash className='h-4 w-4' /> {t('transactionList.delete')}
                                  </div>
                                </DropdownMenuItem>
                                <Link to={`/dashboard/${isIncome(transaction.type)}/${transaction.id}`}>
                                  <DropdownMenuItem className='flex flex-row items-center gap-2'>
                                    <Pen className='h-4 w-4' /> {t('transactionList.edit')}
                                  </DropdownMenuItem>
                                </Link>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter className="border-0 bg-transparent">
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell
                        colSpan={4}
                        className="sticky bottom-0 z-10 border-t border-border/50 bg-muted py-2.5 pl-4 pr-2 text-sm font-semibold text-muted-foreground shadow-[0_-1px_0_0_hsl(var(--border)/0.35)]"
                      >
                        {t('transactionList.table.sum')}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "sticky bottom-0 z-10 border-t border-border/50 bg-muted py-2.5 px-3 text-right align-middle font-mono text-sm font-bold tabular-nums shadow-[0_-1px_0_0_hsl(var(--border)/0.35)]",
                          tableNetSum >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
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
                  <div key={group.label} className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
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
                              transaction.type === 'receita' ? "bg-emerald-500/10" : "bg-red-500/10"
                            )}
                          >
                            {transaction.type === 'receita' ? (
                              <TrendingUp className="w-5 h-5 text-emerald-500" />
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
                              transaction.type === 'receita' ? "text-emerald-500" : "text-red-500"
                            )}
                          >
                            {formatAmount(transaction.value, transaction.type)}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button size='icon' variant='ghost'>
                                <EllipsisVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel className='select-none'>{t('transactionList.actions')}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setSelectedTransaction(transaction)}>
                                <div className='flex flex-row items-center gap-2'>
                                  <Trash className='h-4 w-4' /> {t('transactionList.delete')}
                                </div>
                              </DropdownMenuItem>
                              <Link to={`/dashboard/${isIncome(transaction.type)}/${transaction.id}`}>
                                <DropdownMenuItem className='flex flex-row items-center gap-2'>
                                  <Pen className='h-4 w-4' /> {t('transactionList.edit')}
                                </DropdownMenuItem>
                              </Link>
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
          onOpenChange={(open) => setSelectedTransaction(open ? selectedTransaction : null)}
          deleteFunction={() => handleDelete(selectedTransaction!.id!)}
          title={t('dialog.deleteTitle')}
          description={t('dialog.deleteDescription')}
          itemDetails={selectedTransaction!}
        />
      )}
      <Sheet open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md sm:w-[min(100%,28rem)]"
          overlayClassName="bg-black/30 dark:bg-black/40"
        >
          <SheetHeader className="mb-2 border-b border-border/50 pb-4">
            <SheetTitle>
              {t('default.add')} {quickAddType === 'receita' ? t('default.receipt') : t('default.expense')}
            </SheetTitle>
            <SheetDescription>
              {t('transactionList.allHistory')}
            </SheetDescription>
          </SheetHeader>
          <div className="pb-6">
            <TransactionForm
              type={quickAddType}
              mode="sheet"
              onSuccess={() => setQuickAddOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TransactionList;
