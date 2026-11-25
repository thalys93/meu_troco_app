import { BackofficeUsersError } from '@/utils/helpers/authGuard';

export function getUsersQueryErrorMessage(
  error: Error | null | undefined,
  t: (key: string) => string
): string {
  if (!error) return t('users.backoffice.loadError');

  switch (error.message) {
    case BackofficeUsersError.FIRESTORE_DENIED:
      return t('users.backoffice.loadErrorFirestore');
    case BackofficeUsersError.FORBIDDEN:
      return t('users.backoffice.loadErrorForbidden');
    default:
      return t('users.backoffice.loadError');
  }
}
