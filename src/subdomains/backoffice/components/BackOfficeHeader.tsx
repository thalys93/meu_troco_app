import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const pathToLabel: Record<string, string> = {
  home: 'sidebar.home',
  plans: 'sidebar.plans',
  plan: 'backoffice.plans',
  notifications: 'sidebar.notifications',
  notification: 'notifications.backoffice.title',
  categories: 'sidebar.categories',
  category: 'categories.backoffice.title',
  users: 'sidebar.users',
  profile: 'sidebar.profile',
  'internal-tasks': 'sidebar.internalTasks',
  'internal-task': 'sidebar.internalTasks',
  roadmap: 'sidebar.roadmapItems',
  'roadmap-catalog': 'sidebar.roadmapCatalog',
  new: 'internalTasks.newTitle',
  edit: 'default.edit',
};

const segmentToListHref: Record<string, string> = {
  plan: '/backoffice/plans',
  notification: '/backoffice/notifications',
  category: '/backoffice/categories',
  'internal-task': '/backoffice/internal-tasks',
  roadmap: '/backoffice/roadmap',
};

function BackOfficeHeader() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const segments = pathname.replace(/^\/backoffice\/?/, '').split('/').filter(Boolean);
  const breadcrumbs = [
    { label: t('sidebar.backoffice'), href: '/backoffice/home' },
    ...segments.map((segment, i) => {
      const href =
        segmentToListHref[segment] ?? '/backoffice/' + segments.slice(0, i + 1).join('/');
      const key = segment;
      const labelKey = pathToLabel[key] ?? key;
      const label = pathToLabel[key] ? t(labelKey) : key;
      return { label, href };
    }),
  ];

  return (
    <header className="shrink-0 flex-1 border-b border-border/60 bg-card/40 backdrop-blur-sm px-4 py-3" aria-label={t('sidebar.navigation')}>
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.href}
                className="hover:text-primary transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    </header>
  );
}

export default BackOfficeHeader;
