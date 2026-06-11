import { Bell, Home, ShoppingBag, Tags, User, Users, type LucideIcon } from 'lucide-react';

export type BackofficeNavItem = {
  key: string;
  href: string;
  icon: LucideIcon;
  labelKey: string;
  searchKeywords?: string[];
};

export const BACKOFFICE_NAV_ITEMS: BackofficeNavItem[] = [
  { key: 'home', href: '/backoffice/home', icon: Home, labelKey: 'sidebar.home', searchKeywords: ['inicio', 'dashboard', 'home'] },
  { key: 'users', href: '/backoffice/users', icon: Users, labelKey: 'sidebar.users', searchKeywords: ['usuarios', 'users', 'contas'] },
  { key: 'plans', href: '/backoffice/plans', icon: ShoppingBag, labelKey: 'sidebar.plans', searchKeywords: ['planos', 'plans', 'assinatura'] },
  { key: 'notifications', href: '/backoffice/notifications', icon: Bell, labelKey: 'sidebar.notifications', searchKeywords: ['notificacoes', 'changelog', 'avisos'] },
  { key: 'categories', href: '/backoffice/categories', icon: Tags, labelKey: 'sidebar.categories', searchKeywords: ['categorias', 'categories'] },
];

export const BACKOFFICE_QUICK_LINKS: BackofficeNavItem[] = [
  { key: 'profile', href: '/backoffice/profile', icon: User, labelKey: 'sidebar.profile', searchKeywords: ['perfil', 'profile', 'conta', 'configuracoes'] },
];

export function filterBackofficeNav(
  items: BackofficeNavItem[],
  query: string,
  getLabel: (labelKey: string) => string
): BackofficeNavItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter((item) => {
    const label = getLabel(item.labelKey).toLowerCase();
    const keywords = item.searchKeywords ?? [];
    return (
      label.includes(normalized) ||
      item.key.includes(normalized) ||
      keywords.some((keyword) => keyword.includes(normalized) || normalized.includes(keyword))
    );
  });
}
