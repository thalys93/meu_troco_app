import { AccountTypes } from '@/types/enums/AccountsTypes';

const raw = import.meta.env.VITE_ADMIN_UIDS;
export const whitelist: string[] = typeof raw === 'string'
  ? raw.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

export function canListAllUsers(
  uid: string | null | undefined,
  accountType?: AccountTypes
): boolean {
  if (!uid) return false;
  if (accountType === AccountTypes.ADMIN) return true;
  return whitelist.includes(uid);
}

export const BackofficeUsersError = {
  FORBIDDEN: 'BACKOFFICE_USERS_FORBIDDEN',
  FIRESTORE_DENIED: 'BACKOFFICE_USERS_FIRESTORE_DENIED',
} as const;
