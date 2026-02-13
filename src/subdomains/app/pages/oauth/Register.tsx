/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Label } from '@/components/ui/label'
import { Input, PasswordInput } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { AlertCircle, ArrowLeft, DollarSign, Lock, Mail, User, AlignLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { SignUpForm, SignUpSchema } from '@/types/validation/signUp'
import { useCreateWithEmail, useLoginWithEmail } from '@/utils/api/auth'
import { Checkbox } from '@/components/ui/checkbox'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/hooks/use-toast'
import { passwordRules } from '@/utils/helpers/formRules'
import useUserStore from '@/store/UserStore'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SocialAuthGroup from '../../components/SocialAuthGroup'
import LegalModals from '@/shared/components/LegalModals'

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
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { setUid } = useUserStore();
    const title = "Meu Troco";

    const signUpForm = useForm<SignUpForm>({
        defaultValues: initialValues,
        resolver: zodResolver(SignUpSchema)
    })

    const handleCreate = useCreateWithEmail();
    const handleLogin = useLoginWithEmail();
    const passwordValue = signUpForm.watch("password");

    const [legalModal, setLegalModal] = React.useState<{ isOpen: boolean, type: 'terms' | 'privacy' }>({
        isOpen: false,
        type: 'terms'
    });

    const openLegalModal = (e: React.MouseEvent, type: 'terms' | 'privacy') => {
        e.preventDefault();
        e.stopPropagation();
        setLegalModal({ isOpen: true, type });
    };

    const randomQuote = React.useMemo(() => {
        const quotes = ['q1', 'q2', 'q3'];
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    }, []);

    const handleSubmit = async (data: SignUpForm) => {
        if (!data.checkedTerms) {
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
            ...data,
            selectedPlan: "Básico"
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
            <div className='bg-muted/30 p-4 rounded-xl border border-muted-foreground/10 mb-4'>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
                    {t('signIn.passwordCheckListTitle')}
                </p>
                <ul className='text-xs space-y-1.5 grid grid-cols-2'>
                    <li className={checks.upper ? "text-emerald-500 flex items-center gap-1.5" : "text-muted-foreground/60 flex items-center gap-1.5"}>
                        <div className={`w-1.5 h-1.5 rounded-full ${checks.upper ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                        1 {t('passwordChecklist.upperLetters')}
                    </li>
                    <li className={checks.lower ? "text-emerald-500 flex items-center gap-1.5" : "text-muted-foreground/60 flex items-center gap-1.5"}>
                        <div className={`w-1.5 h-1.5 rounded-full ${checks.lower ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                        1 {t('passwordChecklist.lowLetters')}
                    </li>
                    <li className={checks.number ? "text-emerald-500 flex items-center gap-1.5" : "text-muted-foreground/60 flex items-center gap-1.5"}>
                        <div className={`w-1.5 h-1.5 rounded-full ${checks.number ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                        1 {t('passwordChecklist.numbers')}
                    </li>
                    <li className={checks.special ? "text-emerald-500 flex items-center gap-1.5" : "text-muted-foreground/60 flex items-center gap-1.5"}>
                        <div className={`w-1.5 h-1.5 rounded-full ${checks.special ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                        1 {t('passwordChecklist.specialCaracters')}
                    </li>
                    <li className={checks.minLength ? "text-emerald-500 flex items-center gap-1.5" : "text-muted-foreground/60 flex items-center gap-1.5"}>
                        <div className={`w-1.5 h-1.5 rounded-full ${checks.minLength ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                        8 {t('passwordChecklist.moreCaracters')}
                    </li>
                </ul>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-background">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden md:flex md:w-1/2 lg:w-[50%] relative p-12 flex-col justify-between overflow-hidden"
            >
                <div className="absolute inset-0 bg-white dark:bg-emerald-950/20 transition-colors duration-500" />
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1],
                            x: [0, 50, 0],
                            y: [0, -30, 0]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] bg-primary rounded-full filter blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.05, 0.15, 0.05],
                            x: [0, -50, 0],
                            y: [0, 50, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-1/4 -right-1/4 w-[70%] h-[70%] bg-emerald-200 dark:bg-emerald-600 rounded-full filter blur-[100px]"
                    />
                </div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10 cursor-pointer group" onClick={() => navigate("/")}>
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-primary/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-emerald-100 dark:border-white/10 group-hover:scale-105 transition-transform">
                            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-primary" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</span>
                    </div>

                    <div className="max-w-md">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
                            {t('signIn.hero_title')}
                        </h2>
                        <p className="text-slate-600 dark:text-emerald-100/70 text-lg leading-relaxed">
                            {t('signIn.hero_description')}
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl max-w-sm shadow-xl shadow-slate-200/50 dark:shadow-emerald-500/5">
                        <p className="text-slate-700 dark:text-white/80 italic mb-4">
                            "{t(`login.quotes.${randomQuote}`)}"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-primary/20 border border-emerald-200 dark:border-primary/30 flex items-center justify-center text-emerald-700 dark:text-primary font-bold">MT</div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-medium text-sm">{t('login.team')}</p>
                                <p className="text-slate-500 dark:text-emerald-400 text-xs select-none">{t('login.appDescription')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Form Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-background relative overflow-y-auto">
                <div className="w-full flex items-center justify-end gap-4 mb-4 md:absolute md:top-6 md:right-6 md:mb-0">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('navigation.back')}
                    </Button>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="md:hidden flex justify-center mb-8">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t('signIn.title')}</h1>
                        <p className="text-muted-foreground">
                            {t('signIn.login_call')}{' '}
                            <Link to="/oauth/login" className="font-semibold text-primary hover:underline">
                                {t('signIn.login_access')}
                            </Link>
                        </p>
                    </div>

                    <Form form={signUpForm} onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">{t('signIn.nameLabel')}</Label>
                                <Input
                                    leftIcon={<AlignLeft className='w-5 h-5 text-muted-foreground/60' />}
                                    type="text"
                                    name="firstName"
                                    placeholder="John"
                                    control={signUpForm.control}
                                    className="h-12 bg-muted/30 focus:bg-background transition-all border-muted-foreground/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">{t('signIn.lastNameLabel')}</Label>
                                <Input
                                    leftIcon={<AlignLeft className='w-5 h-5 text-muted-foreground/60' />}
                                    type="text"
                                    name="lastName"
                                    placeholder="Doe"
                                    control={signUpForm.control}
                                    className="h-12 bg-muted/30 focus:bg-background transition-all border-muted-foreground/10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('login.emailInput')}</Label>
                            <Input
                                leftIcon={<Mail className='w-5 h-5 text-muted-foreground/60' />}
                                type="email"
                                name="email"
                                placeholder={t('login.emailPlaceholder')}
                                control={signUpForm.control}
                                className="h-12 bg-muted/30 focus:bg-background transition-all border-muted-foreground/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t('login.passwordInput')}</Label>
                            <PasswordInput
                                leftIcon={<Lock className='w-5 h-5 text-muted-foreground/60' />}
                                name="password"
                                placeholder={t('login.passwordPlaceholder')}
                                control={signUpForm.control}
                                className="h-12 bg-muted/30 focus:bg-background transition-all border-muted-foreground/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t('signIn.confirmPasswordLabel')}</Label>
                            <PasswordInput
                                leftIcon={<Lock className='w-5 h-5 text-muted-foreground/60' />}
                                name="confirmPassword"
                                placeholder={t('signIn.confirmPasswordLabel')}
                                control={signUpForm.control}
                                className="h-12 bg-muted/30 focus:bg-background transition-all border-muted-foreground/10"
                            />
                        </div>

                        <PasswordChecklist password={passwordValue} />

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 py-2">
                                <Checkbox
                                    id="checkedTerms"
                                    name="checkedTerms"
                                    onCheckedChange={(checked) => signUpForm.setValue("checkedTerms", !!checked)}
                                />
                                <Label htmlFor="checkedTerms" className="text-sm text-muted-foreground font-normal cursor-pointer">
                                    {t('signIn.termsOfUser_2')} {" "}
                                    <span
                                        onClick={(e) => openLegalModal(e, 'terms')}
                                        className='text-primary hover:underline cursor-pointer font-medium'
                                    >
                                        {t('signIn.termsOfUse')}
                                    </span>
                                    {" "}{t('signIn.and')}{" "}
                                    <span
                                        onClick={(e) => openLegalModal(e, 'privacy')}
                                        className='text-primary hover:underline cursor-pointer font-medium'
                                    >
                                        {t('signIn.privacyPolicy')}
                                    </span>
                                </Label>
                            </div>
                        </div>

                        <LegalModals
                            isOpen={legalModal.isOpen}
                            onOpenChange={(open) => setLegalModal(prev => ({ ...prev, isOpen: open }))}
                            type={legalModal.type}
                        />

                        {handleCreate.error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center space-x-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20"
                            >
                                <AlertCircle className="w-4 h-4" />
                                <span>{handleCreate.error.message}</span>
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                            disabled={handleCreate.isPending}
                        >
                            {handleCreate.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    {t('login.submitLoading')}
                                </div>
                            ) : t('signIn.createAccount')}
                        </Button>
                    </Form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                {t('login.or')}
                            </span>
                        </div>
                    </div>

                    <SocialAuthGroup />
                </motion.div>
            </div>
        </div>
    )
}

export default RegisterPage
