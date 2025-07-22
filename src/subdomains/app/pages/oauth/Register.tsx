/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import PublicLayout from '../../layout/PublicLayout'
import { Label } from '@/components/ui/label'
import { Input, PasswordInput } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { AlertCircle, AlignLeft, DollarSign, Lock, Mail, Shield, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { SignUpForm, SignUpSchema } from '@/types/validation/signUp'
import { useCreateWithEmail, useLoginWithEmail } from '@/utils/api/auth'
import { Checkbox } from '@/components/ui/checkbox'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/hooks/use-toast'
import { passwordRules } from '@/utils/helpers/formRules'
import useUserStore from '@/store/UserStore'
import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetPlans } from '@/utils/api/plans'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

const initialValues: SignUpForm = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    checkedTerms: false,
    selectedPlan: "Básico"
}

function RegisterPage() {
    const signInForm = useForm<SignUpForm>({
        defaultValues: initialValues,
        resolver: zodResolver(SignUpSchema)
    })

    const { setUid } = useUserStore()
    const { t } = useTranslation();

    const selectedPlan = signInForm.watch("selectedPlan");
    const [amount, setAmount] = React.useState();

    const handleCreate = useCreateWithEmail();
    const handleLogin = useLoginWithEmail();
    const passwordValue = signInForm.watch("password");
    const { data: plans, isError } = useGetPlans();
    const navigate = useNavigate();
    const location = useLocation()

    React.useEffect(() => {
        if (location?.state?.plan) {
            signInForm.setValue("selectedPlan", location?.state?.plan)
        }
    }, [location, signInForm])

    function parsePrice(price: string | number): number {
        if (typeof price === 'number') return price;

        return Number(
            price
                .replace(/[^\d.,]/g, '')
                .replace(',', '.')
                .trim()
        );
    }

    const handleSubmit = async (data: SignUpForm) => {
        if (data.checkedTerms === false) {
            toast({
                title: t('toast.warningTitle'),
                description: t('toast.SignInwarningDescription'),
                variant: "info"
            })
            return;
        }

        if (data.password !== data.confirmPassword) {
            toast({
                title: t('toast.warningTitle'),
                description: t('toast.passwordDescription'),
                variant: "info"
            })
            return;
        }        

        handleCreate.mutate({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            selectedPlan: data.selectedPlan
        }, {
            onSuccess: () => {
                toast({
                    title: t('toast.success'),
                    description: t('toast.successSignIn'),
                })

                handleLogin.mutate({
                    email: data.email,
                    password: data.password
                }, {
                    onSuccess: ({ uid }) => {
                        toast({
                            title: t('toast.welcome'),
                            description: t('toast.loginSuccess'),
                        })

                        setUid(uid)
                        navigate("/dashboard")
                    },

                    onError: () => {
                        toast({
                            title: t('toast.errorLogin'),
                            description: t('toast.errorLoginDescription'),
                            variant: "destructive"
                        })
                        navigate("/oauth/login")
                    }
                })
            },
            onError: () => {
                toast({
                    title: t('toast.errorSignIn'),
                    description: t('toast.errorSignInDescription'),
                    variant: "destructive"
                })
            }
        })
    }

    const PasswordChecklist = ({ password }: { password: string }) => {
        const checks = {
            upper: passwordRules.upper.test(password),
            lower: passwordRules.lower.test(password),
            number: passwordRules.number.test(password),
            special: passwordRules.special.test(password),
            minLength: passwordRules.minLength.test(password)
        }

        return (
            <ul className='text-sm mt-2 space-y-1 grid grid-cols-2'>
                <li className={checks.upper ? "text-green-500" : "text-red-500"}>1 {t('passwordChecklist.upperLetters')}</li>
                <li className={checks.lower ? "text-green-500" : "text-red-500"}>1 {t('passwordChecklist.lowLetters')}</li>
                <li className={checks.number ? "text-green-500" : "text-red-500"}>1 {t('passwordChecklist.numbers')}</li>
                <li className={checks.special ? "text-green-500" : "text-red-500"}>1 {t('passwordChecklist.specialCaracters')}</li>
                <li className={checks.minLength ? "text-green-500" : "text-red-500"}>8 {t('passwordChecklist.moreCaracters')}</li>
            </ul>
        )
    }

    return (
        <PublicLayout type="simple">
            <div className="flex items-center justify-center bg-gradient-to-br from-background via-background to-emerald-950/20 p-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                                <User className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('signIn.title')}</h1>
                        <p className="text-muted-foreground mt-2">{t('signIn.description')}</p>
                    </div>

                    <Card className="glass-card">
                        <CardHeader className="space-y-2 mb-0 pb-0">
                            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
                            <CardDescription>
                                {t('signIn.cardDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form form={signInForm} onSubmit={handleSubmit} className="grid grid-cols-2 space-y-4 items-center justify-center gap-3">
                                <div className='col-span-2 md:col-span-1 mt-auto space-y-2 md:mt-4'>
                                    <Label htmlFor='lastName'>{t('signIn.nameLabel')}</Label>
                                    <Input
                                        leftIcon={<AlignLeft className='w-5 h-5' />}
                                        type="text"
                                        name="firstName"
                                        placeholder="John"
                                        control={signInForm.control}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>

                                <div className='col-span-2 md:col-span-1 mt-auto space-y-2'>
                                    <Label htmlFor='lastName'>{t('signIn.lastNameLabel')}</Label>
                                    <Input
                                        leftIcon={<AlignLeft className='w-5 h-5' />}
                                        type="text"
                                        name="lastName"
                                        placeholder="Doe"
                                        control={signInForm.control}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="email">{t('login.emailInput')}</Label>
                                    <Input
                                        leftIcon={<Mail className='w-5 h-5' />}
                                        type="email"
                                        name="email"
                                        placeholder={t('login.emailPlaceholder')}
                                        control={signInForm.control}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="password">{t('login.passwordInput')}</Label>
                                    <PasswordInput
                                        leftIcon={<Lock className='w-5 h-5' />}
                                        type="password"
                                        name="password"
                                        placeholder={t('login.passwordPlaceholder')}
                                        control={signInForm.control}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="password">{t('signIn.confirmPasswordLabel')}</Label>
                                    <PasswordInput
                                        leftIcon={<Lock className='w-5 h-5' />}
                                        type="password"
                                        name="confirmPassword"
                                        placeholder={t('signIn.confirmPasswordLabel')}
                                        control={signInForm.control}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="password" className='text-foreground'>{t('signIn.passwordCheckListTitle')}</Label>
                                    <PasswordChecklist password={passwordValue} />
                                </div>

                                <div className='col-span-2 space-y-2'>
                                    <Select value={selectedPlan} onValueChange={(e) => signInForm.setValue("selectedPlan", e)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Plano de assinatura (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {plans?.length && plans?.map((plan) => (
                                                <SelectItem value={plan.title} >
                                                    {plan.title} - {plan.price}
                                                </SelectItem>
                                            ))}

                                            {isError && (
                                                <div className="flex items-center space-x-2 text-destructive text-sm justify-center select-none my-5">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>Falha ao obter os planos</span>
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="password">{t('footer.terms_of_use')}</Label>
                                    <div className="flex items-center space-x-2 py-2">
                                        <Checkbox
                                            name="checkedTerms"
                                            onCheckedChange={(checked) => signInForm.setValue("checkedTerms", checked ? true : false)}
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {t('signIn.termsOfUser_2')} <Link to="#" className='text-primary hover:underline transition-all'>{t('signIn.termsOfUse')}</Link> {t('signIn.and')} {" "}
                                            <Link to="#" className='text-primary hover:underline transition-all'>{t('signIn.privacyPolicy')}</Link>
                                        </span>
                                    </div>
                                </div>

                                {handleCreate.error && (
                                    <div className="flex items-center space-x-2 text-destructive text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{handleCreate.error.message}</span>
                                    </div>
                                )}

                                <motion.div
                                    key={selectedPlan !== "Básico" ? "show" : "hide"}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={selectedPlan !== "Básico" ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                                    transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                                    className='flex col-span-2 justify-center items-center'
                                >
                                    <Badge className='flex flex-row gap-2 items-center justify-center w-full select-none' variant='secondary'>
                                        <Shield className='w-6 h-6 my-2' />
                                        <span> Transação 100% segura e privada</span>
                                        <div className='h-5 w-0.5 bg-muted-foreground rounded-full select-none' />
                                        <img src="/mercado-pago.png" className='h-10 w-10 object-contain' />
                                    </Badge>
                                </motion.div>

                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 col-span-2"
                                    disabled={handleCreate.isPending}
                                >
                                    {selectedPlan !== "Básico" ? (
                                        handleCreate.isPending ? t('login.submitLoading') : t('signIn.checkout')
                                    ) : (
                                        handleCreate.isPending ? t('login.submitLoading') : t('signIn.createAccount')
                                    )}
                                </Button>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    )
}


export default RegisterPage
