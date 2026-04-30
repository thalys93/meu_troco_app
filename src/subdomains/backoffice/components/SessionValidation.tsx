import React, { useEffect, useRef, useState } from 'react'
import PublicLayout from '@/subdomains/backoffice/layout/PublicLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import useUserStore from '@/store/UserStore'
import { useUser } from '@/hooks/use-user'
import { useGetUserData } from '@/utils/services/api/auth'
import { AccountTypes } from '@/types/enums/AccountsTypes'
import { User } from '@/types/entities/User'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { onAuthStateChanged } from 'firebase/auth'
import { AuthProvider } from '@/utils/services/api/firebase'

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
                navigate("/backoffice/login", { replace: true });
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
                    title: "Erro",
                    description: t('backoffice.security.toastError'),
                    variant: 'destructive',
                });
                setTimeout(() => navigate("/backoffice/login", { replace: true }), 1700);
                return;
            }

            if (data.accountType !== AccountTypes.ADMIN) {
                setValue(20);
                toast({
                    title: "Erro",
                    description: t('backoffice.security.toastError'),
                    variant: 'destructive',
                });
                setTimeout(() => navigate("/backoffice/login", { replace: true }), 1700);
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
            setTimeout(() => navigate("/backoffice/home", { replace: true }), 1200);
        };

        runValidation();
    }, [isFetching, data, isError, uid, navigate, t, handleAddUser]);

    return (
        <PublicLayout>
            <section className="flex items-center justify-center bg-gradient-to-br from-background via-background to-emerald-950/20 p-4">
                <div className='w-full max-w-md my-5'>
                    <Card>
                        <CardHeader className='space-y-1 flex justify-center items-center gap-3'>
                            <h1 className='text-2xl font-bold text-center'>{t('backoffice.security.sessionTitle')}</h1>
                            <p className='text-muted-foreground text-center'>{t('backoffice.security.sessionDescription')}</p>
                            <Loader2 className='animate-spin' />
                        </CardHeader>
                        <CardContent>
                            <Progress value={value} max={100} />
                        </CardContent>
                    </Card>
                </div>
            </section>
        </PublicLayout>
    )
}

export default SessionValidation