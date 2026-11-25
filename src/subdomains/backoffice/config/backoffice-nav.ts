import { Award, Bell, CalendarRange, Home, ListTodo, Map, ShoppingBag, Tags, User, Users, type LucideIcon } from 'lucide-react';

export type BackofficeNavItem = {
  key: string;
  href?: string;
  icon: LucideIcon;
  labelKey: string;
  searchKeywords?: string[];
  children?: BackofficeNavItem[];
};

export const BACKOFFICE_NAV_ITEMS: BackofficeNavItem[] = [
  { key: 'home', href: '/backoffice/home', icon: Home, labelKey: 'sidebar.home', searchKeywords: ['inicio', 'dashboard', 'home'] },
  { key: 'users', href: '/backoffice/users', icon: Users, labelKey: 'sidebar.users', searchKeywords: ['usuarios', 'users', 'contas'] },
  { key: 'plans', href: '/backoffice/plans', icon: ShoppingBag, labelKey: 'sidebar.plans', searchKeywords: ['planos', 'plans', 'assinatura'] },
  { key: 'goal-catalog', href: '/backoffice/goal-catalog', icon: Award, labelKey: 'sidebar.goalCatalog', searchKeywords: ['ranks', 'ranking', 'niveis', 'catalogo', 'gamificacao'] },
  { key: 'internal-tasks', href: '/backoffice/internal-tasks', icon: ListTodo, labelKey: 'sidebar.internalTasks', searchKeywords: ['tarefas', 'tasks', 'operacional'] },
  {
    key: 'roadmap',
    icon: Map,
    labelKey: 'sidebar.roadmap',
    searchKeywords: ['roadmap', 'desenvolvimento', 'produto', 'fases', 'trimestre'],
    children: [
      { key: 'roadmap-items', href: '/backoffice/roadmap', icon: Map, labelKey: 'sidebar.roadmapItems', searchKeywords: ['itens', 'kanban', 'timeline'] },
      { key: 'roadmap-catalog', href: '/backoffice/roadmap-catalog', icon: CalendarRange, labelKey: 'sidebar.roadmapCatalog', searchKeywords: ['catalogo', 'anos', 'trimestres', 'fases'] },
    ],
  },
  { key: 'notifications', href: '/backoffice/notifications', icon: Bell, labelKey: 'sidebar.notifications', searchKeywords: ['notificacoes', 'changelog', 'avisos'] },
  { key: 'categories', href: '/backoffice/categories', icon: Tags, labelKey: 'sidebar.categories', searchKeywords: ['categorias', 'categories'] },
];

export const BACKOFFICE_QUICK_LINKS: BackofficeNavItem[] = [
  { key: 'profile', href: '/backoffice/profile', icon: User, labelKey: 'sidebar.profile', searchKeywords: ['perfil', 'profile', 'conta', 'configuracoes'] },
];

function itemMatchesQuery(item: BackofficeNavItem, normalized: string, getLabel: (labelKey: string) => string) {
  const label = getLabel(item.labelKey).toLowerCase();
  const keywords = item.searchKeywords ?? [];
  return (
    label.includes(normalized) ||
    item.key.includes(normalized) ||
    keywords.some((keyword) => keyword.includes(normalized) || normalized.includes(keyword))
  );
}

export function filterBackofficeNav(
  items: BackofficeNavItem[],
  query: string,
  getLabel: (labelKey: string) => string
): BackofficeNavItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.reduce<BackofficeNavItem[]>((acc, item) => {
    if (item.children?.length) {
      const matchingChildren = item.children.filter((child) => itemMatchesQuery(child, normalized, getLabel));
      if (itemMatchesQuery(item, normalized, getLabel) || matchingChildren.length > 0) {
        acc.push({
          ...item,
          children: matchingChildren.length > 0 ? matchingChildren : item.children,
        });
      }
      return acc;
    }

    if (itemMatchesQuery(item, normalized, getLabel)) {
      acc.push(item);
    }
    return acc;
  }, []);
}

export function flattenBackofficeNav(items: BackofficeNavItem[]): BackofficeNavItem[] {
  return items.flatMap((item) => (item.children?.length ? item.children : [item]));
}
