import { User } from '@/types/entities/User';
import { AccountTypes } from '@/types/enums/AccountsTypes';

export const FREE_PLAN_KEY = 'free';

export function getUserPlanKey(user: User): string {
  return user.billing?.selectedPlan?.trim() || FREE_PLAN_KEY;
}

export function getUserDisplayName(user: User): string {
  return user.displayName || user.fullName || user.email || user.uid;
}

export function getUserCreatedAt(user: User): Date | null {
  const createdAt = user.details?.createdAt;
  if (!createdAt) return null;
  if (typeof createdAt.toDate === 'function') return createdAt.toDate();
  if (createdAt instanceof Date) return createdAt;
  return null;
}

export function filterUsers(users: User[], query: string): User[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return users;

  return users.filter((user) => {
    const name = getUserDisplayName(user).toLowerCase();
    const email = (user.email ?? '').toLowerCase();
    const uid = user.uid.toLowerCase();
    const plan = getUserPlanKey(user).toLowerCase();
    return (
      name.includes(normalized) ||
      email.includes(normalized) ||
      uid.includes(normalized) ||
      plan.includes(normalized)
    );
  });
}

export function groupUsersByAccountType(users: User[]): Record<AccountTypes, User[]> {
  return users.reduce(
    (acc, user) => {
      const type = user.accountType === AccountTypes.ADMIN ? AccountTypes.ADMIN : AccountTypes.USER;
      acc[type].push(user);
      return acc;
    },
    { [AccountTypes.USER]: [] as User[], [AccountTypes.ADMIN]: [] as User[] }
  );
}

export function groupUsersByPlan(users: User[]): Record<string, User[]> {
  return users.reduce<Record<string, User[]>>((acc, user) => {
    const plan = getUserPlanKey(user);
    if (!acc[plan]) acc[plan] = [];
    acc[plan].push(user);
    return acc;
  }, {});
}

export function sortUsersByName(users: User[]): User[] {
  return [...users].sort((a, b) =>
    getUserDisplayName(a).localeCompare(getUserDisplayName(b), undefined, { sensitivity: 'base' })
  );
}

export function sortPlanKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    if (a === FREE_PLAN_KEY) return -1;
    if (b === FREE_PLAN_KEY) return 1;
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  });
}
