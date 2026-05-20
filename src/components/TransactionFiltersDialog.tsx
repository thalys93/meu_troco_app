import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Filter, TrendingUp, TrendingDown, CreditCard, Tag, RotateCcw, List, CircleDollarSign } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore';
import { useCategories, type CategoryWithIcon } from '@/hooks/use-categories';
import { useWalletsStore } from '@/store/useWalletsStore';
import { cn } from '@/lib/utils';
import React from 'react';

type Filters = {
  card: string;
  categories: string[];
  type: string;
  minValue: string;
  maxValue: string;
  startDate: string;
  endDate: string;
};

interface TransactionFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Filters;
  onChange: (key: keyof Filters, value: string | string[]) => void;
  filteredCount: number;
  /** Se definido, substitui o reset padrão (ex.: realinhar datas ao mês selecionado). */
  onClearAll?: () => void;
}

export default function TransactionFiltersDialog({
  open,
  onOpenChange,
  filters,
  onChange,
  filteredCount,
  onClearAll,
}: TransactionFiltersDialogProps) {
  const { t } = useTranslation();
  const { uid } = useUserStore();
  const { allCategories, getCategoryLabel } = useCategories();
  const { wallets, fetchWallets } = useWalletsStore();

  React.useEffect(() => {
    if (open && uid) fetchWallets(uid);
  }, [open, uid, fetchWallets]);

  const walletOptions = React.useMemo(() => {
    const mapped = wallets.map((wallet) => ({ id: wallet.id, name: wallet.name, color: wallet.color }));
    return [
      { id: 'Todos', name: t('filters.all', 'Todos'), color: undefined },
      { id: 'no_wallet', name: t('wallets.noWallet', 'Sem Carteira'), color: '#6b7280' },
      ...mapped,
    ];
  }, [wallets, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          {t('filters.button', 'Filtrar')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl w-[calc(100vw-2rem)] sm:w-auto p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('filters.title', 'Filtros')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('filters.type', 'Tipo')}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'Todos', label: t('filters.all', 'Todos'), icon: <List className="w-4 h-4" /> },
                { id: 'receita', label: t('sidebar.income', 'Receita'), icon: <TrendingUp className="w-4 h-4 text-primary" /> },
                { id: 'despesa', label: t('sidebar.expenses', 'Despesa'), icon: <TrendingDown className="w-4 h-4 text-red-500" /> },
              ].map((opt) => (
                <Button
                  key={opt.id}
                  variant="outline"
                  className={cn(
                    "justify-start gap-2 h-10",
                    filters.type === opt.id &&
                    (opt.id === "receita"
                      ? "border-primary ring-1 ring-primary/30"
                      : opt.id === "despesa"
                        ? "border-red-500 ring-1 ring-red-500/30"
                        : "border-foreground ring-1 ring-foreground/20")
                  )}
                  onClick={() => onChange('type', opt.id)}
                >
                  {opt.icon}
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t('filters.wallet', 'Carteira')}
            </Label>
            <div className="flex flex-wrap gap-2">
              {walletOptions.map((opt) => (
                <Button
                  key={opt.id}
                  variant="outline"
                  className={cn(
                    "rounded-full h-9 px-3",
                    filters.card === opt.id && "border-foreground"
                  )}
                  style={
                    filters.card === opt.id && opt.color
                      ? {
                        borderColor: opt.color,
                        boxShadow: `0 0 0 2px ${opt.color}33`,
                      }
                      : undefined
                  }
                  onClick={() => onChange('card', opt.id)}
                >
                  <span className="flex items-center gap-2">
                    {opt.color && (
                      <span
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ backgroundColor: opt.color }}
                      />
                    )}
                    {opt.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {t('filters.categories', 'Categorias')}
            </Label>
            <CategoryChips
              values={filters.categories}
              categories={allCategories}
              onChange={(v) => onChange('categories', v)}
              allLabel={t('filters.all', 'Todos')}
              showMoreLabel={t('filters.showMore', 'Mostrar mais...')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('filters.minValue', 'Valor mínimo')}</Label>
              <Input
                name="minValue"
                type="number"
                step="0.01"
                value={filters.minValue}
                onChange={(e) => onChange('minValue', e.target.value)}
                className="bg-background/50 h-10 border-input"
                leftIcon={<CircleDollarSign className="w-4 h-4" />}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('filters.maxValue', 'Valor máximo')}</Label>
              <Input
                name="maxValue"
                type="number"
                step="0.01"
                value={filters.maxValue}
                onChange={(e) => onChange('maxValue', e.target.value)}
                className="bg-background/50 h-10 border-input"
                leftIcon={<CircleDollarSign className="w-4 h-4" />}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('filters.from', 'De')}</Label>
              <Input
                name="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => onChange('startDate', e.target.value)}
                className="bg-background/50 h-10 border-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('filters.till', 'Até')}</Label>
              <Input
                name="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => onChange('endDate', e.target.value)}
                className="bg-background/50 h-10 border-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 sticky bottom-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 -mx-4 sm:mx-0 border-t">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (onClearAll) {
                  onClearAll();
                  return;
                }
                onChange('card', 'Todos');
                onChange('categories', ['Todos']);
                onChange('type', 'Todos');
                onChange('minValue', '');
                onChange('maxValue', '');
                onChange('startDate', '');
                onChange('endDate', '');
              }}
            >
              <RotateCcw className="w-4 h-4" />
              {t('filters.clearAll', 'Limpar tudo')}
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              {t('filters.applyCount', 'Mostrar')} {filteredCount} {t('filters.items', 'transações')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CategoryChips({
  values,
  categories,
  onChange,
  allLabel,
  showMoreLabel,
}: {
  values: string[];
  categories: CategoryWithIcon[];
  onChange: (v: string[]) => void;
  allLabel: string;
  showMoreLabel: string;
}) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = React.useState(false);
  const normalized = React.useMemo(
    () => categories.filter((c) => c.id !== allLabel && c.id !== 'Todos'),
    [categories, allLabel]
  );
  const allEntry = categories.find((c) => c.id === 'Todos');
  const base = allEntry ? [allEntry, ...normalized] : normalized;
  const visible = showMore ? base : base.slice(0, 9);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {visible.map((cat) => {
          const Icon = cat.icon;
          const isAll = cat.id === allLabel || cat.id === 'Todos';
          const isSelected = values.includes(cat.id) || (isAll && (values.includes('Todos') || values.includes(allLabel)));
          return (
            <Button
              key={cat.id}
              variant="outline"
              className={cn(
                "rounded-full h-9 px-3 gap-1.5",
                isSelected && "border-foreground ring-2 ring-foreground/20"
              )}
              onClick={() => {
                if (isAll) {
                  onChange(['Todos']);
                  return;
                }
                const next = values.includes('Todos') || values.includes(allLabel)
                  ? [cat.id]
                  : values.includes(cat.id)
                    ? values.filter((v) => v !== cat.id)
                    : [...values, cat.id];
                onChange(next.length === 0 ? ['Todos'] : next);
              }}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              <span>{isAll ? allLabel : getCategoryLabel(cat.id)}</span>
            </Button>
          );
        })}
      </div>
      {!showMore && base.length > visible.length && (
        <button
          className="text-sm text-primary hover:underline"
          onClick={() => setShowMore(true)}
        >
          {showMoreLabel}
        </button>
      )}
    </div>
  );
}
