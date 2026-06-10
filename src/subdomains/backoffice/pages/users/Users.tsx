import React, { useMemo, useState } from 'react';
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import BackofficeSectionCard from '@/subdomains/backoffice/components/BackofficeSectionCard';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Shield, Users as UsersIcon, CreditCard } from 'lucide-react';
import { useGetAllUsers } from '@/utils/services/api/api';
import { EmptyIcon } from '@phosphor-icons/react';
import { AccountTypes } from '@/types/enums/AccountsTypes';
import UserRow from './UserRow';
import {
  filterUsers,
  groupUsersByAccountType,
  groupUsersByPlan,
  sortPlanKeys,
  sortUsersByName,
  FREE_PLAN_KEY,
} from './users-list-utils';
import { getUsersQueryErrorMessage } from '../../utils/users-query-error';

type GroupingMode = 'type' | 'plan';

const TYPE_SECTIONS = [
  {
    key: AccountTypes.USER,
    titleKey: 'users.backoffice.sectionUsers',
    accent: 'border-sky-500/40',
    headerBg: 'bg-gradient-to-r from-sky-500/8 via-sky-500/4 to-transparent',
    icon: UsersIcon,
  },
  {
    key: AccountTypes.ADMIN,
    titleKey: 'users.backoffice.sectionAdmins',
    accent: 'border-violet-500/40',
    headerBg: 'bg-gradient-to-r from-violet-500/8 via-violet-500/4 to-transparent',
    icon: Shield,
  },
] as const;

function UsersPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useGetAllUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [grouping, setGrouping] = useState<GroupingMode>('type');

  const users = useMemo(() => sortUsersByName(data?.users ?? []), [data?.users]);
  const filteredUsers = useMemo(() => filterUsers(users, searchQuery), [users, searchQuery]);

  const groupedByType = useMemo(() => groupUsersByAccountType(filteredUsers), [filteredUsers]);
  const groupedByPlan = useMemo(() => groupUsersByPlan(filteredUsers), [filteredUsers]);
  const planKeys = useMemo(() => sortPlanKeys(Object.keys(groupedByPlan)), [groupedByPlan]);

  const isEmpty = !isLoading && users.length === 0;
  const isSearchEmpty = !isLoading && users.length > 0 && filteredUsers.length === 0;

  return (
    <PrivateLayout>
      <PageShell
        title={t('users.backoffice.title')}
        description={t('users.backoffice.description')}
        eyebrow={t('sidebar.backoffice')}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex rounded-lg border border-border/80 bg-muted/30 p-1 w-fit">
              <Button
                type="button"
                size="sm"
                variant={grouping === 'type' ? 'default' : 'ghost'}
                onClick={() => setGrouping('type')}
              >
                {t('users.backoffice.tabByType')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={grouping === 'plan' ? 'default' : 'ghost'}
                onClick={() => setGrouping('plan')}
              >
                {t('users.backoffice.tabByPlan')}
              </Button>
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('users.backoffice.searchPlaceholder')}
                className="pl-8 bg-card"
              />
            </div>
          </div>

          {isError && (
            <div className="bo-surface p-6 text-center space-y-3">
              <p className="text-sm text-destructive">{getUsersQueryErrorMessage(error, t)}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                {t('users.backoffice.retry')}
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((key) => (
                <div key={key} className="bo-surface h-48 animate-pulse" />
              ))}
            </div>
          )}

          {isEmpty && !isError && (
            <div className="bo-surface p-8 flex flex-col items-center gap-2 text-muted-foreground">
              <EmptyIcon className="w-8 h-8" />
              <p className="text-sm">{t('users.backoffice.empty')}</p>
            </div>
          )}

          {isSearchEmpty && !isError && (
            <div className="bo-surface p-8 text-center text-sm text-muted-foreground">
              {t('users.backoffice.emptySearch', { query: searchQuery })}
            </div>
          )}

          {!isLoading && !isError && filteredUsers.length > 0 && grouping === 'type' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {TYPE_SECTIONS.map((section) => {
                const sectionUsers = groupedByType[section.key];
                return (
                  <BackofficeSectionCard
                    key={section.key}
                    title={t(section.titleKey)}
                    subtitle={t('users.backoffice.sectionCount', { count: sectionUsers.length })}
                    icon={section.icon}
                    accent={section.accent}
                    headerBg={section.headerBg}
                    isEmpty={sectionUsers.length === 0}
                    emptyContent={t('users.backoffice.emptySection')}
                  >
                    {sectionUsers.map((user) => (
                      <UserRow key={user.uid} user={user} />
                    ))}
                  </BackofficeSectionCard>
                );
              })}
            </div>
          )}

          {!isLoading && !isError && filteredUsers.length > 0 && grouping === 'plan' && (
            <div className={cn('grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4')}>
              {planKeys.map((planKey) => {
                const sectionUsers = groupedByPlan[planKey] ?? [];
                const planLabel =
                  planKey === FREE_PLAN_KEY ? t('users.backoffice.plan.free') : planKey;
                return (
                  <BackofficeSectionCard
                    key={planKey}
                    title={t('users.backoffice.sectionPlan', { plan: planLabel })}
                    subtitle={t('users.backoffice.sectionCount', { count: sectionUsers.length })}
                    icon={CreditCard}
                    accent="border-emerald-500/40"
                    headerBg="bg-gradient-to-r from-emerald-500/8 via-emerald-500/4 to-transparent"
                    isEmpty={sectionUsers.length === 0}
                    emptyContent={t('users.backoffice.emptySection')}
                  >
                    {sectionUsers.map((user) => (
                      <UserRow key={user.uid} user={user} />
                    ))}
                  </BackofficeSectionCard>
                );
              })}
            </div>
          )}
        </div>
      </PageShell>
    </PrivateLayout>
  );
}

export default UsersPage;
