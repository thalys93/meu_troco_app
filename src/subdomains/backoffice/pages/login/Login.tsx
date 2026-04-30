import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input, PasswordInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import useUserStore from '@/store/UserStore'
import { LoginForm } from '@/types/validation/login'
import { useLoginWithEmail } from '@/utils/services/api/auth'
import { AlertCircle, ArrowLeft, Lock, Mail, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { usePublicAuthGuard } from '@/hooks/use-public-auth-guard'

const initialValues: LoginForm = {
  email: '',
  password: '',
}

function BackofficeLoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setUid } = useUserStore()
  const title = 'Meu Troco Backoffice'
  const { isAuthChecking } = usePublicAuthGuard({
    authenticatedRedirectTo: '/backoffice/session-validation',
    unauthorizedRedirectTo: '/dashboard',
    minLoadingMs: 2200,
    requireAdmin: true,
  })

  const loginForm = useForm<LoginForm>({
    defaultValues: initialValues,
  })
  const login = useLoginWithEmail()

  const handleSubmit = (data: LoginForm) => {
    login.mutate(data, {
      onSuccess: ({ uid }) => {
        toast({
          title: t('toast.welcomeBack'),
          description: t('toast.loginSuccess'),
        })
        setUid(uid)
        navigate('/backoffice/session-validation', { replace: true })
      },
      onError: () => {
        toast({
          title: t('toast.errorLogin'),
          description: t('toast.errorLogin2'),
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-background relative">
      {isAuthChecking && (
        <div className="absolute top-0 left-0 h-1 w-full bg-primary/15 z-50 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}
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
              y: [0, -30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] bg-primary rounded-full filter blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.05, 0.15, 0.05],
              x: [0, -50, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/4 -right-1/4 w-[70%] h-[70%] bg-emerald-200 dark:bg-emerald-600 rounded-full filter blur-[100px]"
          />
        </div>

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="relative z-10">
          <div
            className="flex items-center gap-3 mb-10 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-emerald-50 dark:bg-primary/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-emerald-100 dark:border-white/10 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-emerald-600 dark:text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
              {t('backoffice.login.hero_title')}
            </h2>
            <p className="text-slate-600 dark:text-emerald-100/70 text-lg leading-relaxed">
              {t('backoffice.login.hero_description')}
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl max-w-sm shadow-xl shadow-slate-200/50 dark:shadow-emerald-500/5">
            <p className="text-slate-700 dark:text-white/80 text-sm mb-4">
              {t('backoffice.login.description')}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-primary/20 border border-emerald-200 dark:border-primary/30 flex items-center justify-center text-emerald-700 dark:text-primary font-bold">
                MT
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-medium text-sm">
                  {t('backoffice.login.team')}
                </p>
                <p className="text-slate-500 dark:text-emerald-400 text-xs select-none">
                  {t('backoffice.login.teamDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t('backoffice.login.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('backoffice.login.card_description')}
            </p>
          </div>

          <div className="space-y-6">
            <Form form={loginForm} onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('login.emailInput')}</Label>
                <Input
                  leftIcon={<Mail className="w-5 h-5 text-muted-foreground/60" />}
                  type="email"
                  name="email"
                  placeholder={t('login.emailPlaceholder')}
                  control={loginForm.control}
                  className="h-12 bg-muted/30 focus:bg-background transition-all border-muted-foreground/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('login.passwordInput')}</Label>
                <PasswordInput
                  leftIcon={<Lock className="w-5 h-5 text-muted-foreground/60" />}
                  type="password"
                  name="password"
                  placeholder={t('login.passwordPlaceholder')}
                  control={loginForm.control}
                  className="h-12 bg-muted/30 focus:bg-background transition-all border-muted-foreground/10"
                />
              </div>

              {login.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{login.error.message}</span>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                disabled={login.isPending || isAuthChecking}
              >
                {login.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    {t('login.submitLoading')}
                  </div>
                ) : (
                  t('login.access')
                )}
              </Button>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BackofficeLoginPage
