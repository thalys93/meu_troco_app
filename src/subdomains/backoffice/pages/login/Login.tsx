import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input, PasswordInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import useUserStore from '@/store/UserStore'
import { LoginForm } from '@/types/validation/login'
import { useLoginWithEmail } from '@/utils/services/api/auth'
import { AlertCircle, ArrowUpRight, Lock, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePublicAuthGuard } from '@/hooks/use-public-auth-guard'
import AuthSplitLayout from '@/subdomains/app/components/AuthSplitLayout'

const initialValues: LoginForm = {
  email: '',
  password: '',
}

function BackofficeLoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setUid } = useUserStore()
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
    <>
      {isAuthChecking && (
        <div className="fixed left-0 top-0 z-50 h-1 w-full overflow-hidden bg-primary/15">
          <motion.div
            className="h-full bg-primary"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      <AuthSplitLayout
        variant="backoffice"
        className="backoffice-page"
        footer={t('backoffice.login.hero_description')}
      >
        <div className="space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t('backoffice.login.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('backoffice.login.card_description')}
            </p>
          </div>

          <Form form={loginForm} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.emailInput')}</Label>
              <Input
                leftIcon={<Mail className="h-5 w-5 text-muted-foreground/60" />}
                type="email"
                name="email"
                placeholder={t('login.emailPlaceholder')}
                control={loginForm.control}
                className="h-12 border-border/80 bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('login.passwordInput')}</Label>
              <PasswordInput
                leftIcon={<Lock className="h-5 w-5 text-muted-foreground/60" />}
                type="password"
                name="password"
                placeholder={t('login.passwordPlaceholder')}
                control={loginForm.control}
                className="h-12 border-border/80 bg-background"
              />
            </div>

            {login.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{login.error.message}</span>
              </motion.div>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-full text-base font-semibold shadow-md shadow-primary/20"
              disabled={login.isPending || isAuthChecking}
            >
              {login.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  {t('login.submitLoading')}
                </div>
              ) : (
                <span className="inline-flex items-center gap-2">
                  {t('login.access')}
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </Form>
        </div>
      </AuthSplitLayout>
    </>
  )
}

export default BackofficeLoginPage
