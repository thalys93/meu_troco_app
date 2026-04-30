import React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import useUserStore from '@/store/UserStore';
import { AccountTypes } from '@/types/enums/AccountsTypes';
import { AuthProvider, FireStore } from '@/utils/services/api/firebase';

type PublicAuthGuardOptions = {
  authenticatedRedirectTo: string;
  unauthorizedRedirectTo?: string;
  minLoadingMs?: number;
  requireAdmin?: boolean;
};

const wait = (ms: number) => new Promise<void>((resolve) => {
  window.setTimeout(() => resolve(), ms);
});

export const usePublicAuthGuard = ({
  authenticatedRedirectTo,
  unauthorizedRedirectTo,
  minLoadingMs = 1800,
  requireAdmin = false,
}: PublicAuthGuardOptions) => {
  const navigate = useNavigate();
  const { setUid, removeUid, removeUser } = useUserStore();
  const [isAuthChecking, setIsAuthChecking] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const startedAt = Date.now();

    const finishFlow = async (redirectTo?: string) => {
      const elapsedMs = Date.now() - startedAt;
      const remainingMs = minLoadingMs - elapsedMs;

      if (remainingMs > 0) {
        await wait(remainingMs);
      }

      if (!isMounted) {
        return;
      }

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }

      setIsAuthChecking(false);
    };

    const unsubscribe = onAuthStateChanged(AuthProvider, async (firebaseUser) => {
      if (!firebaseUser?.uid) {
        removeUid();
        removeUser();
        await finishFlow();
        return;
      }

      setUid(firebaseUser.uid);

      if (!requireAdmin) {
        await finishFlow(authenticatedRedirectTo);
        return;
      }

      const userDoc = await getDoc(doc(FireStore, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      const isAdmin = userData?.accountType === AccountTypes.ADMIN;

      if (isAdmin) {
        await finishFlow(authenticatedRedirectTo);
        return;
      }

      await finishFlow(unauthorizedRedirectTo ?? '/dashboard');
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [authenticatedRedirectTo, minLoadingMs, navigate, removeUid, removeUser, requireAdmin, setUid, unauthorizedRedirectTo]);

  return { isAuthChecking };
};
