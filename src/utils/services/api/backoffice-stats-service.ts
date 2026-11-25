import { AccountTypes } from '@/types/enums/AccountsTypes';
import {
  BackofficeUsersError,
  canListAllUsers,
} from '@/utils/helpers/authGuard';
import type { TransactionType } from '@/utils/services/api/transation';
import { collection, collectionGroup, getDocs } from 'firebase/firestore';
import { FireStore } from './firebase';

export interface BackofficePlatformStats {
  users: number;
  expenses: number;
  income: number;
  bills: number;
  wallets: number;
}

const EMPTY_STATS: BackofficePlatformStats = {
  users: 0,
  expenses: 0,
  income: 0,
  bills: 0,
  wallets: 0,
};

function countTransactionsByType(docs: { data: () => Record<string, unknown> }[]) {
  const counts = { expenses: 0, income: 0, bills: 0 };

  docs.forEach((docSnap) => {
    const type = docSnap.data().type as TransactionType | undefined;
    if (type === 'despesa') counts.expenses += 1;
    else if (type === 'receita') counts.income += 1;
    else if (type === 'conta') counts.bills += 1;
  });

  return counts;
}

export async function fetchPlatformStats(
  uid: string,
  accountType?: AccountTypes
): Promise<BackofficePlatformStats> {
  if (!canListAllUsers(uid, accountType)) {
    throw new Error(BackofficeUsersError.FORBIDDEN);
  }

  try {
    const [usersSnapshot, transactionsSnapshot, walletsSnapshot] = await Promise.all([
      getDocs(collection(FireStore, 'users')),
      getDocs(collectionGroup(FireStore, 'userTransactions')),
      getDocs(collection(FireStore, 'wallets')),
    ]);

    const { expenses, income, bills } = countTransactionsByType(transactionsSnapshot.docs);

    return {
      users: usersSnapshot.size,
      expenses,
      income,
      bills,
      wallets: walletsSnapshot.size,
    };
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === 'permission-denied') {
      throw new Error(BackofficeUsersError.FIRESTORE_DENIED);
    }
    throw error;
  }
}

export { EMPTY_STATS as emptyPlatformStats };
