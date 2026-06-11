import React, { useEffect, useRef, useState } from 'react';
import PublicLayout from '@/subdomains/backoffice/layout/PublicLayout';
import { Loader2, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import useUserStore from '@/store/UserStore';
import { useUser } from '@/hooks/use-user';
import { useGetUserData } from '@/utils/services/api/auth';
import { AccountTypes } from '@/types/enums/AccountsTypes';
import { User } from '@/types/entities/User';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthProvider } from '@/utils/services/api/firebase';
import { motion } from 'framer-motion';

function SessionValidation() {
  const { uid, setUid, removeUid, removeUser } = useUserStore();
  const { handleAddUser } = useUser();
  const [value, setValue] = useState(0);
  const { data, isFetching, isError } = useGetUserData(uid ?? undefined);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasValidated = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(AuthProvider, (firebaseUser) => {
      if (!firebaseUser?.uid) {
        removeUid();
        removeUser();
        navigate('/backoffice/login', { replace: true });
        return;
      }

      if (uid !== firebaseUser.uid) {
        setUid(firebaseUser.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate, removeUid, removeUser, setUid, uid]);

  useEffect(() => {
    if (isFetching && uid) setValue(10);
  }, [isFetching, uid]);

  useEffect(() => {
    if (isFetching || !uid || hasValidated.current) return;

    hasValidated.current = true;

    const runValidation = async () => {
      setValue(25);
      await new Promise((r) => setTimeout(r, 800));

      if (isError || !data) {
        setValue(20);
        toast({
          title: t('toast.error'),
          description: t('backoffice.security.toastError'),
          variant: 'destructive',
        });
        setTimeout(() => navigate('/backoffice/login', { replace: true }), 1700);
        return;
      }

      if (data.accountType !== AccountTypes.ADMIN) {
        setValue(20);
        toast({
          title: t('toast.error'),
          description: t('backoffice.security.toastError'),
          variant: 'destructive',
        });
        setTimeout(() => navigate('/backoffice/login', { replace: true }), 1700);
        return;
      }

      setValue(55);
      handleAddUser(data as User);
      await new Promise((r) => setTimeout(r, 800));

      setValue(85);
      await new Promise((r) => setTimeout(r, 600));

      setValue(100);
      toast({
        title: t('toast.successVar'),
        description: t('toast.successDescription'),
      });
      setTimeout(() => navigate('/backoffice/home', { replace: true }), 1200);
    };

    runValidation();
  }, [isFetching, data, isError, uid, navigate, t, handleAddUser]);

  return (
    <PublicLayout>
      <section className="flex min-h-[70vh] items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bo-surface-elevated p-8 space-y-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{t('backoffice.security.sessionTitle')}</h1>
                <p className="text-muted-foreground text-sm mt-2">{t('backoffice.security.sessionDescription')}</p>
              </div>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <Progress value={value} max={100} className="h-2" />
          </div>
        </motion.div>
      </section>
    </PublicLayout>
  );
}

export default SessionValidation;
