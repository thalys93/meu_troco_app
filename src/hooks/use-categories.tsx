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

export type CategoryWithIcon = { id: string; icon: LucideIcon };

const INCOME_CATEGORIES: CategoryWithIcon[] = [
  { id: 'Salário', icon: Banknote },
  { id: 'Freelancer', icon: Laptop },
  { id: 'Negócios', icon: Briefcase },
  { id: 'Investimentos', icon: TrendingUp },
  { id: 'Trabalho Paralelo', icon: Clock },
  { id: 'Outro', icon: CircleDollarSign },
];

const EXPENSE_CATEGORIES: CategoryWithIcon[] = [
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

export const useCategories = () => {
  const incomeCategories = INCOME_CATEGORIES;
  const expenseCategories = EXPENSE_CATEGORIES;
  const allCategories: CategoryWithIcon[] = [
    ...incomeCategories,
    ...expenseCategories.filter((e) => !incomeCategories.some((i) => i.id === e.id)),
    { id: 'Todos', icon: List },
  ];

  const allCategoryIds = allCategories.map((c) => c.id);

  return {
    incomeCategories,
    expenseCategories,
    allCategories,
    allCategoryIds,
    getCategoryIcon: (id: string): LucideIcon | undefined =>
      [...incomeCategories, ...expenseCategories].find((c) => c.id === id)?.icon ??
      (id === 'Todos' ? List : undefined),
  };
};
