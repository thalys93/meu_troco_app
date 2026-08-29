import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lock, Mail, ArrowUpRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import SocialAuthGroup from '../../components/SocialAuthGroup';
import AuthSplitLayout from '../../components/AuthSplitLayout';
import { Link, useNavigate } from 'react-router-dom';
import { Input, PasswordInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { LoginForm } from '@/types/validation/login';
import { useLoginWithEmail } from '@/utils/services/api/auth';
import { Form } from '@/components/ui/form';
import useUserStore from '@/store/UserStore';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { usePublicAuthGuard } from '@/hooks/use-public-auth-guard';

const initialValues: LoginForm = {
  email: '',
  password: '',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthChecking } = usePublicAuthGuard({
    authenticatedRedirectTo: '/dashboard',
    minLoadingMs: 1800,
  });

  const loginForm = useForm<LoginForm>({
    defaultValues: initialValues,
  });
  const login = useLoginWithEmail();
  const { setUid } = useUserStore();

  const handleSubmit = (data: LoginForm) => {
    login.mutate(data, {
      onSuccess: ({ uid }) => {
        toast({
          title: t('toast.welcomeBack'),
          description: t('toast.loginSuccess'),
        });
        setUid(uid);
        navigate('/dashboard', { replace: true });
      },
      onError: () => {
        toast({
          title: t('toast.errorLogin'),
          description: t('toast.errorLogin2'),
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <>
      {isAuthChecking && (
        <div className="fixed left-0 top-0 z-50 h-1 w-full overflow-hidden bg-primary/15">
          <motion.div
            className="h-full bg-primary"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}
      <AuthSplitLayout footer={t('login.hero_description')}>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('login.welcome')}</h1>
          <p className="text-sm text-muted-foreground">{t('login.card_description')}</p>
        </div>

        <SocialAuthGroup />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-[0.14em]">
            <span className="bg-card px-3 text-muted-foreground">{t('login.or')}</span>
          </div>
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
              className="h-12 border-border/80 bg-background transition-colors focus:bg-background"
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
              className="h-12 border-border/80 bg-background transition-colors focus:bg-background"
            />
          </div>

          {login.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4" />
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

        <p className="text-center text-sm text-muted-foreground">
          {t('login.accountCall')}{' '}
          <Link to="/oauth/register" className="font-semibold text-primary hover:underline">
            {t('login.createAccountNow')}
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
    </>
  );
};

export default LoginPage;
