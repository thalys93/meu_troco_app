import { useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Banknote,
  Briefcase,
  CircleDollarSign,
  Clock,
  Laptop,
  TrendingUp,
  Home,
  UtensilsCrossed,
  Car,
  Wrench,
  Heart,
  Gamepad2,
  ShoppingCart,
  GraduationCap,
  Plane,
  HandCoins,
  CreditCard,
  Tag,
  List,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetCategories } from '@/utils/services/api/categories-service';
import { getCategoryLocalized, type Category, type CategoryTransactionType } from '@/types/Category';
import { resolveCategoryIcon } from '@/utils/category-icons';

export type CategoryWithIcon = { id: string; icon: LucideIcon };

const STATIC_INCOME: CategoryWithIcon[] = [
  { id: 'Salário', icon: Banknote },
  { id: 'Freelancer', icon: Laptop },
  { id: 'Negócios', icon: Briefcase },
  { id: 'Investimentos', icon: TrendingUp },
  { id: 'Trabalho Paralelo', icon: Clock },
  { id: 'Outro', icon: CircleDollarSign },
];

const STATIC_EXPENSE: CategoryWithIcon[] = [
  { id: 'Moradia', icon: Home },
  { id: 'Alimentação', icon: UtensilsCrossed },
  { id: 'Transporte', icon: Car },
  { id: 'Serviços', icon: Wrench },
  { id: 'Saúde', icon: Heart },
  { id: 'Entretenimento', icon: Gamepad2 },
  { id: 'Compras', icon: ShoppingCart },
  { id: 'Educação', icon: GraduationCap },
  { id: 'Viagem', icon: Plane },
  { id: 'Empréstimo', icon: HandCoins },
  { id: 'Fatura Cartão', icon: CreditCard },
  { id: 'Outro', icon: Tag },
];

function categoryMatchesType(category: Category, type: CategoryTransactionType): boolean {
  if (category.showInBothTypes) return true;
  return category.type === type;
}

function toCategoryWithIcon(category: Category): CategoryWithIcon {
  return {
    id: category.id,
    icon: resolveCategoryIcon(category.icon) ?? Tag,
  };
}

function buildCategoryLookup(categories: Category[]): Map<string, Category> {
  const map = new Map<string, Category>();
  categories.forEach((c) => {
    map.set(c.id, c);
    if (c.legacyKey) map.set(c.legacyKey, c);
  });
  return map;
}

function resolveCategory(
  categoryRef: string,
  lookup: Map<string, Category>
): Category | undefined {
  return lookup.get(categoryRef);
}

function categoryRefsEquivalent(
  refA: string,
  refB: string,
  lookup: Map<string, Category>
): boolean {
  if (refA === refB) return true;
  const catA = resolveCategory(refA, lookup);
  const catB = resolveCategory(refB, lookup);
  if (catA && catB) return catA.id === catB.id;
  if (catA) return catA.id === refB || catA.legacyKey === refB;
  if (catB) return refA === catB.id || refA === catB.legacyKey;
  return false;
}

export function transactionCategoryMatchesFilter(
  transactionCategory: string,
  selectedCategories: string[],
  lookup: Map<string, Category> | undefined
): boolean {
  if (selectedCategories.includes('Todos')) return true;
  if (!lookup || lookup.size === 0) {
    return selectedCategories.includes(transactionCategory);
  }
  return selectedCategories.some((selected) =>
    categoryRefsEquivalent(selected, transactionCategory, lookup)
  );
}

export const useCategories = () => {
  const { t, i18n } = useTranslation();
  const { data: remoteCategories, isLoading, isError } = useGetCategories();

  const useRemote = !isError && remoteCategories && remoteCategories.length > 0;

  const categoryLookup = useMemo(() => {
    if (!useRemote || !remoteCategories) return new Map<string, Category>();
    return buildCategoryLookup(remoteCategories);
  }, [useRemote, remoteCategories]);

  const incomeCategories = useMemo(() => {
    if (!useRemote) return STATIC_INCOME;
    return remoteCategories
      .filter((c) => categoryMatchesType(c, 'receita'))
      .map(toCategoryWithIcon);
  }, [useRemote, remoteCategories]);

  const expenseCategories = useMemo(() => {
    if (!useRemote) return STATIC_EXPENSE;
    return remoteCategories
      .filter((c) => categoryMatchesType(c, 'despesa'))
      .map(toCategoryWithIcon);
  }, [useRemote, remoteCategories]);

  const allCategories: CategoryWithIcon[] = useMemo(() => {
    const merged = [
      ...incomeCategories,
      ...expenseCategories.filter((e) => !incomeCategories.some((i) => i.id === e.id)),
      { id: 'Todos', icon: List },
    ];
    return merged;
  }, [incomeCategories, expenseCategories]);

  const allCategoryIds = allCategories.map((c) => c.id);

  const getCategoryIcon = useCallback(
    (categoryRef: string): LucideIcon | undefined => {
      if (categoryRef === 'Todos') return List;
      if (useRemote) {
        const remote = resolveCategory(categoryRef, categoryLookup);
        if (remote) return resolveCategoryIcon(remote.icon) ?? Tag;
      }
      return (
        [...STATIC_INCOME, ...STATIC_EXPENSE].find((c) => c.id === categoryRef)?.icon ??
        undefined
      );
    },
    [useRemote, categoryLookup]
  );

  const getCategoryLabel = useCallback(
    (categoryRef: string): string => {
      if (categoryRef === 'Todos') return t('categories.Todos', 'Todos');
      if (useRemote) {
        const remote = resolveCategory(categoryRef, categoryLookup);
        if (remote) return getCategoryLocalized(remote, i18n.language);
      }
      return t(`categories.${categoryRef}`, categoryRef);
    },
    [useRemote, categoryLookup, t, i18n.language]
  );

  return {
    incomeCategories,
    expenseCategories,
    allCategories,
    allCategoryIds,
    categoryLookup,
    getCategoryIcon,
    getCategoryLabel,
    isLoading,
    isError,
  };
};
