import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Input, PasswordInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import useUserStore from '@/store/UserStore'
import PublicLayout from '@/subdomains/backoffice/layout/PublicLayout'
import { LoginForm } from '@/types/validation/login'
import { useLoginWithEmail } from '@/utils/services/api/auth'
import { AlertCircle, Lock, Mail, Shield } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const initialValues: LoginForm = {
    email: "",
    password: ""
}

function BackofficeLoginPage() {
    const backofficeForm = useForm({
        defaultValues: initialValues
    });

    const { t } = useTranslation();
    const { setUid } = useUserStore();
    const navigate = useNavigate();
    const mutate = useLoginWithEmail();

    const onSubmit = (data: LoginForm) => mutate.mutate(data, {
        onSuccess: ({ uid }) => {
            toast({
                title: "Atenção",
                description: "Redirecionando Você..",
            })
            setUid(uid)
            navigate("/backoffice/session-validation");
        }
    });

    return (
        <PublicLayout>
            <section className="flex items-center justify-center bg-gradient-to-br from-background via-background to-emerald-950/20 p-4">
                <div className="w-full max-w-md my-5">
                    <Card className='glass-card'>
                        <CardHeader className='space-y-1 flex justify-center items-center gap-3'>
                            <Shield className='w-14 h-14 text-primary transition-all duration-300 hover:scale-110 hover:text-yellow-200'/>
                            <CardTitle>{t('backoffice.login.title')}</CardTitle>
                            <span>
                                {t('backoffice.login.description')}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <Form form={backofficeForm} onSubmit={onSubmit} className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label>{t('login.emailInput')}</Label>
                                    <Input
                                        leftIcon={<Mail className='w-5 h-5' />}
                                        type="email"
                                        name="email"
                                        placeholder={t('login.emailPlaceholder')}
                                        control={backofficeForm.control}
                                        className="bg-background/50"
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor="password">{t('login.passwordInput')}</Label>
                                    <PasswordInput
                                        leftIcon={<Lock className='w-5 h-5' />}
                                        type="password"
                                        name="password"
                                        placeholder={t('login.passwordPlaceholder')}
                                        control={backofficeForm.control}
                                        className="bg-background/50"
                                    />
                                </div>

                                {mutate.error && (
                                    <div className="flex items-center space-x-2 text-destructive text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{mutate.error.message}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90"
                                    disabled={mutate.isPending}
                                >
                                    {mutate.isPending ? t('login.submitLoading') : t('login.access')}
                                </Button>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </PublicLayout>
    )
}

export default BackofficeLoginPage