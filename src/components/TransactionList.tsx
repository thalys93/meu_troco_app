import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Loader2, EllipsisVertical, Trash, Pen } from 'lucide-react';
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
import { useCategories } from '@/hooks/use-categories';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  isLoading: boolean
  limit?: number
  scrollClassName?: string
}

const TransactionList = ({ transactions, title = "Transações Recentes", isLoading, limit, scrollClassName = 'max-h-[350px] overflow-auto' }: TransactionListProps) => {
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
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [filtersOpen, setFiltersOpen] = React.useState<boolean>(false);


  const formatAmount = (amount: number, type: 'receita' | 'despesa') => {
    const formatted = `$${amount.toLocaleString()}`;
    return type === 'receita' ? `+${formatted}` : `-${formatted}`;
  };

  const parseLocalDate = (raw?: string) => {
    if (!raw) return new Date();
    const [y, m, d] = raw.split('-');
    const year = Number(y);
    const month = Number(m) - 1;
    const day = Number(d);
    return new Date(year, month, day);
  };

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
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

  const isPendingTransaction = (id: string) => {
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
    const start = startDate ? parseLocalDate(startDate) : undefined;
    const end = endDate ? parseLocalDate(endDate) : undefined;

    return (displayTransactions || []).filter((tr) => {
      const trDate = parseLocalDate(tr.date);
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
    }).sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());
  }, [displayTransactions, filterCard, filterCategories, filterType, minValue, maxValue, startDate, endDate]);

  const groupedByDay = React.useMemo(() => {
    const groups: { label: string; items: Transaction[] }[] = [];
    const map = new Map<string, Transaction[]>();

    filteredTransactions.forEach((tr) => {
      const d = parseLocalDate(tr.date);
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

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
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
                  case 'startDate':
                    setStartDate(value as string); break;
                  case 'endDate':
                    setEndDate(value as string); break;
                }
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <ToggleGroup
              type="single"
              value={filterType}
              onValueChange={(v) => v && setFilterType(v)}
              variant="outline"
              size="sm"
              className="flex-wrap gap-2"
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
              <span className='text-muted-foreground text-sm select-none'>{t('transactionList.loading')}</span>
            </div>
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
                          isPendingTransaction(transaction.id) && "pointer-events-none animate_pulse"
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
          deleteFunction={() => handleDelete(selectedTransaction!.id)}
          title={t('dialog.deleteTitle')}
          description={t('dialog.deleteDescription')}
          itemDetails={selectedTransaction!}
        />
      )}
    </>
  );
};

export default TransactionList;
