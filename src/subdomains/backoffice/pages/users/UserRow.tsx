import { Badge } from '@/components/ui/badge';
import { User } from '@/types/entities/User';
import { AccountTypes } from '@/types/enums/AccountsTypes';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { getUserCreatedAt, getUserDisplayName, getUserPlanKey, FREE_PLAN_KEY } from './users-list-utils';

type UserRowProps = {
  user: User;
};

function UserRow({ user }: UserRowProps) {
  const { t } = useTranslation();
  const displayName = getUserDisplayName(user);
  const planKey = getUserPlanKey(user);
  const createdAt = getUserCreatedAt(user);
  const isAdmin = user.accountType === AccountTypes.ADMIN;
  const avatar = user.details?.avatar;

  const planLabel =
    planKey === FREE_PLAN_KEY ? t('users.backoffice.plan.free') : planKey;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 py-3 hover:bg-muted/30 transition-colors">
      <div className="min-w-0 flex-1 flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover border border-border/60"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary border border-primary/20">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{displayName}</span>
            <Badge
              variant="outline"
              className={
                isAdmin
                  ? 'rounded-md font-normal bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30'
                  : 'rounded-md font-normal'
              }
            >
              {isAdmin
                ? t('users.backoffice.accountType.admin')
                : t('users.backoffice.accountType.user')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col sm:items-end gap-0.5 text-xs text-muted-foreground sm:min-w-[140px]">
        <span>
          {t('users.backoffice.fieldPlan')}:{' '}
          <span className="font-medium text-foreground">{planLabel}</span>
        </span>
        {createdAt && (
          <span>
            {t('users.backoffice.fieldJoined')}:{' '}
            <span className="font-medium text-foreground">{dayjs(createdAt).format('DD/MM/YYYY')}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default UserRow;
