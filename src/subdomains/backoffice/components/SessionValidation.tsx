/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import PublicLayout from '@/subdomains/backoffice/layout/PublicLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

function SessionValidation() {
    const { uid } = useUserStore();
    const { handleAddUser } = useUser();
    const [value, setValue] = React.useState(0);
    const { data, isFetching } = useGetUserData(uid);
    const {t} = useTranslation();
    const navigate = useNavigate();

    React.useEffect(() => {
        const dynamicProgress = async () => {
            if (isFetching) setValue(10);            
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (data) setValue(50);
            const validateData = () => {
                if (data?.accountType !== AccountTypes.ADMIN) return false
                return true
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
            const dataIsValidated = validateData();
            if (dataIsValidated === true) {
                setValue(70)
                handleAddUser(data as User);
                setTimeout(() => {
                    setValue(100);
                }, 1000);

                toast({
                    title: t('toast.successVar'),
                    description: t('toast.successDescription'),
                })

                setTimeout(() => {
                    navigate("/backoffice/home");
                }, 2000);
            } else {
                setValue(20);
                setTimeout(() => { setValue(10) }, 1000);
                setTimeout(() => { setValue(0) }, 1000);
                toast({
                    title: "Erro",
                    description: t('backoffice.security.toastError'),
                })

                setTimeout(() => {
                    navigate("/backoffice/login");
                }, 2000);
            };
        }

        dynamicProgress();

    }, []);

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