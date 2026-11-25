/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input, PasswordInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { AlertCircle, Lock, Mail, AlignLeft, ArrowUpRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { SignUpForm, SignUpSchema } from '@/types/validation/signUp';
import { useCreateWithEmail, useLoginWithEmail } from '@/utils/services/api/auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { passwordRules } from '@/utils/helpers/formRules';
import useUserStore from '@/store/UserStore';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import SocialAuthGroup from '../../components/SocialAuthGroup';
import AuthSplitLayout from '../../components/AuthSplitLayout';
import LegalModals from '@/shared/components/LegalModals';

const initialValues: SignUpForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  checkedTerms: false,
  selectedPlan: 'Básico',
};

function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setUid } = useUserStore();

  const signUpForm = useForm<SignUpForm>({
    defaultValues: initialValues,
    resolver: zodResolver(SignUpSchema),
  });

  const handleCreate = useCreateWithEmail();
  const handleLogin = useLoginWithEmail();
  const passwordValue = signUpForm.watch('password');

  const [legalModal, setLegalModal] = React.useState<{ isOpen: boolean; type: 'terms' | 'privacy' }>({
    isOpen: false,
    type: 'terms',
  });

  const openLegalModal = (e: React.MouseEvent, type: 'terms' | 'privacy') => {
    e.preventDefault();
    e.stopPropagation();
    setLegalModal({ isOpen: true, type });
  };

  const handleSubmit = async (data: SignUpForm) => {
    if (!data.checkedTerms) {
      toast({
        title: t('toast.warningTitle'),
        description: t('toast.SignInwarningDescription'),
        variant: 'info',
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast({
        title: t('toast.warningTitle'),
        description: t('toast.passwordDescription'),
        variant: 'info',
      });
      return;
    }

    handleCreate.mutate(
      {
        ...data,
        selectedPlan: 'Básico',
      },
      {
        onSuccess: () => {
          toast({
            title: t('toast.success'),
            description: t('toast.successSignIn'),
          });

          handleLogin.mutate(
            {
              email: data.email,
              password: data.password,
            },
            {
              onSuccess: ({ uid }) => {
                toast({
                  title: t('toast.welcome'),
                  description: t('toast.loginSuccess'),
                });
                setUid(uid);
                navigate('/dashboard');
              },
              onError: () => {
                toast({
                  title: t('toast.errorLogin'),
                  description: t('toast.errorLoginDescription'),
                  variant: 'destructive',
                });
                navigate('/oauth/login');
              },
            }
          );
        },
        onError: () => {
          toast({
            title: t('toast.errorSignIn'),
            description: t('toast.errorSignInDescription'),
            variant: 'destructive',
          });
        },
      }
    );
  };

  const PasswordChecklist = ({ password }: { password: string }) => {
    const checks = {
      upper: passwordRules.upper.test(password),
      lower: passwordRules.lower.test(password),
      number: passwordRules.number.test(password),
      special: passwordRules.special.test(password),
      minLength: passwordRules.minLength.test(password),
    };

    return (
      <div className="mb-2 rounded-xl border border-border/70 bg-muted/40 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('signIn.passwordCheckListTitle')}
        </p>
        <ul className="grid grid-cols-2 gap-y-1.5 text-xs">
          <li className={`flex items-center gap-1.5 ${checks.upper ? 'text-primary' : 'text-muted-foreground/60'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${checks.upper ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            1 {t('passwordChecklist.upperLetters')}
          </li>
          <li className={`flex items-center gap-1.5 ${checks.lower ? 'text-primary' : 'text-muted-foreground/60'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${checks.lower ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            1 {t('passwordChecklist.lowLetters')}
          </li>
          <li className={`flex items-center gap-1.5 ${checks.number ? 'text-primary' : 'text-muted-foreground/60'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${checks.number ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            1 {t('passwordChecklist.numbers')}
          </li>
          <li className={`flex items-center gap-1.5 ${checks.special ? 'text-primary' : 'text-muted-foreground/60'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${checks.special ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            1 {t('passwordChecklist.specialCaracters')}
          </li>
          <li className={`flex items-center gap-1.5 ${checks.minLength ? 'text-primary' : 'text-muted-foreground/60'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${checks.minLength ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            8 {t('passwordChecklist.moreCaracters')}
          </li>
        </ul>
      </div>
    );
  };

  return (
    <AuthSplitLayout footer={t('signIn.hero_description')}>
      <div className="space-y-5">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('signIn.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('signIn.login_call')}{' '}
            <Link to="/oauth/login" className="font-semibold text-primary hover:underline">
              {t('signIn.login_access')}
            </Link>
          </p>
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

        <Form form={signUpForm} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('signIn.nameLabel')}</Label>
              <Input
                leftIcon={<AlignLeft className="h-5 w-5 text-muted-foreground/60" />}
                type="text"
                name="firstName"
                placeholder="John"
                control={signUpForm.control}
                className="h-12 border-border/80 bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('signIn.lastNameLabel')}</Label>
              <Input
                leftIcon={<AlignLeft className="h-5 w-5 text-muted-foreground/60" />}
                type="text"
                name="lastName"
                placeholder="Doe"
                control={signUpForm.control}
                className="h-12 border-border/80 bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('login.emailInput')}</Label>
            <Input
              leftIcon={<Mail className="h-5 w-5 text-muted-foreground/60" />}
              type="email"
              name="email"
              placeholder={t('login.emailPlaceholder')}
              control={signUpForm.control}
              className="h-12 border-border/80 bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('login.passwordInput')}</Label>
            <PasswordInput
              leftIcon={<Lock className="h-5 w-5 text-muted-foreground/60" />}
              name="password"
              placeholder={t('login.passwordPlaceholder')}
              control={signUpForm.control}
              className="h-12 border-border/80 bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('signIn.confirmPasswordLabel')}</Label>
            <PasswordInput
              leftIcon={<Lock className="h-5 w-5 text-muted-foreground/60" />}
              name="confirmPassword"
              placeholder={t('signIn.confirmPasswordLabel')}
              control={signUpForm.control}
              className="h-12 border-border/80 bg-background"
            />
          </div>

          <PasswordChecklist password={passwordValue} />

          <div className="flex items-start space-x-2 py-1">
            <Checkbox
              id="checkedTerms"
              name="checkedTerms"
              onCheckedChange={(checked) => signUpForm.setValue('checkedTerms', !!checked)}
              className="mt-0.5"
            />
            <Label htmlFor="checkedTerms" className="cursor-pointer text-sm font-normal text-muted-foreground">
              {t('signIn.termsOfUser_2')}{' '}
              <span
                onClick={(e) => openLegalModal(e, 'terms')}
                className="cursor-pointer font-medium text-primary hover:underline"
              >
                {t('signIn.termsOfUse')}
              </span>{' '}
              {t('signIn.and')}{' '}
              <span
                onClick={(e) => openLegalModal(e, 'privacy')}
                className="cursor-pointer font-medium text-primary hover:underline"
              >
                {t('signIn.privacyPolicy')}
              </span>
            </Label>
          </div>

          <LegalModals
            isOpen={legalModal.isOpen}
            onOpenChange={(open) => setLegalModal((prev) => ({ ...prev, isOpen: open }))}
            type={legalModal.type}
          />

          {handleCreate.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{handleCreate.error.message}</span>
            </motion.div>
          )}

          <Button
            type="submit"
            className="h-12 w-full rounded-full text-base font-semibold shadow-md shadow-primary/20"
            disabled={handleCreate.isPending}
          >
            {handleCreate.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                {t('login.submitLoading')}
              </div>
            ) : (
              <span className="inline-flex items-center gap-2">
                {t('signIn.createAccount')}
                <ArrowUpRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </Form>
      </div>
    </AuthSplitLayout>
  );
}

export default RegisterPage;
