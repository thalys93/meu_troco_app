import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Save, Loader2, Pencil, ChevronRight, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PrivateLayout from '../../layout/PrivateLayout';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input, PasswordInput } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AuthProvider, FireStore } from '@/utils/api/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { AccountProviders } from '@/types/enums/AccountProviders';
import { useUser } from '@/hooks/use-user';
import useUserStore from '@/store/UserStore';
import { useGetUserData } from '@/utils/api/auth';
import ImageDropzone from '@/components/Dropzone';
import axios from 'axios';
import { api } from '@/utils/api/api';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useTranslation } from 'react-i18next';
import { FirebaseTimestamp } from '@/types/Firebase';
import { cn } from '@/lib/utils';

const initialNameForm = {
  name: '',
  email: '',
};

const initialPassForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

function ProfileMenuItem({
  icon,
  title,
  description,
  onClick,
  className,
}: ProfileMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl border border-border/40 bg-card p-4 text-left transition-all hover:bg-muted/50 hover:border-primary/20 active:scale-[0.99]',
        className
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </button>
  );
}

const ProfilePage = () => {
  const { toast } = useToast();
  const { user: userLocal } = useUser();
  const { uid } = useUserStore();
  const { refetch } = useGetUserData(uid);
  const [file, setFile] = useState<File | null>(null);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const {
    expenseLength,
    incomeLength,
    userJoinedTime,
    getDaysSinceUserCreated,
  } = useDashboardStats();

  const nameForm = useForm({
    defaultValues: initialNameForm,
  });

  const passForm = useForm({
    defaultValues: initialPassForm,
  });

  const handleSaveProfile = async (data: typeof initialNameForm) => {
    const { name } = data;
    const firstName = name.trim().split(' ')[0] || '';
    const lastName = name.trim().split(' ').slice(1).join(' ') || '';
    try {
      const userRef = doc(FireStore, 'users', userLocal.uid);

      await updateDoc(userRef, {
        details: {
          avatar: userLocal.details.avatar,
          firstName: firstName,
          lastName: lastName,
          provider: userLocal.details.provider,
          createdAt: userLocal.details.createdAt,
          updatedAt: new Date(),
        },
        displayName: name,
        fullName: name,
      });

      toast({
        title: t('profile.toast.success'),
        description: t('profile.toast.successDescription'),
        variant: 'success',
      });
      refetch();
      setEditOpen(false);
    } catch (error) {
      toast({
        title: t('profile.toast.errorTitle'),
        description: t('profile.toast.errorDescription'),
        variant: 'destructive',
      });
      console.log(error);
    }
  };

  const handleSaveAvatar = async (data: File) => {
    const query = new URLSearchParams({ id: uid });
    setIsLoading(true);
    const { data: config } = await api.get(
      `/cloudinary-signature?${query.toString()}`
    );
    const formData = new FormData();
    formData.append('file', data);
    formData.append('timestamp', config.timestamp.toString());
    formData.append('public_id', config.public_id);
    formData.append('signature', config.signature);
    formData.append('api_key', config.api_key);
    formData.append('uploud_preset', 'meu_troco');
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );
    if (response.status !== 200) throw new Error('Erro ao fazer upload da imagem');
    try {
      const userRef = doc(FireStore, 'users', userLocal.uid);
      await updateDoc(userRef, {
        details: {
          avatar: response.data.secure_url,
          firstName: userLocal.details.firstName,
          lastName: userLocal.details.lastName,
          provider: userLocal.details.provider,
          createdAt: userLocal.details.createdAt,
          updatedAt: new Date(),
        },
      });
      toast({
        title: t('profile.toast.avatarSuccess'),
        description: t('profile.toast.avatarSuccessDescription'),
        variant: 'success',
      });
      refetch();
      setIsLoading(false);
    } catch (error) {
      toast({
        title: t('profile.toast.avatarError'),
        description: t('profile.toast.errorDescription'),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (data: typeof initialPassForm) => {
    if (userLocal?.details?.provider !== AccountProviders.EMAIL) return;
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: t('toast.warningTitle'),
        description: t('profile.toast.passwordDescription'),
        variant: 'destructive',
      });
      return;
    }
    const user = AuthProvider.currentUser;
    if (!user?.email) {
      toast({
        title: t('toast.warningTitle'),
        description: t('profile.toast.userAuth'),
        variant: 'destructive',
      });
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, data.newPassword);
      toast({
        title: t('profile.toast.passwordSuccess'),
        description: t('profile.toast.passwordSuccessDescription'),
        variant: 'success',
      });
      passForm.reset(initialPassForm);
      setPasswordOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('toast.tryAgain');
      toast({
        title: t('profile.toast.passwordErrorTitle'),
        description: message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (userLocal) {
      nameForm.reset({
        name: userLocal.displayName,
        email: userLocal.email ?? '',
      });
    }
  }, [nameForm, userLocal]);

  const stats = [
    {
      value: getDaysSinceUserCreated(userJoinedTime as FirebaseTimestamp),
      label: t('profile.daysOfUse'),
      className: 'text-primary',
    },
    {
      value: incomeLength,
      label: t('sidebar.income'),
      className: 'text-emerald-500',
    },
    {
      value: expenseLength,
      label: t('sidebar.expenses'),
      className: 'text-red-400',
    },
  ];

  return (
    <PrivateLayout>
      <div className="mx-auto w-full max-w-xl mt-4 md:mt-6 px-4 md:px-6 space-y-6 pb-28">
        {/* Header: título + botão editar */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('sidebar.profile')}
          </h1>
          <Sheet open={editOpen} onOpenChange={setEditOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                aria-label={t('profile.editProfile')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-md flex flex-col"
            >
              <SheetHeader>
                <SheetTitle>{t('profile.editProfile')}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <ImageDropzone
                      setFile={setFile}
                      initialImage={userLocal?.details.avatar}
                    />
                  </div>
                </div>
                <Form
                  form={nameForm}
                  onSubmit={handleSaveProfile}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('signIn.nameLabel')}</Label>
                    <Input
                      leftIcon={<User className="w-4 h-4" />}
                      type="text"
                      name="name"
                      placeholder={t('profile.form.namePlaceholder')}
                      control={nameForm.control}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('login.emailInput')}</Label>
                    <Input
                      leftIcon={<Mail className="w-4 h-4" />}
                      type="email"
                      name="email"
                      control={nameForm.control}
                      placeholder={t('login.emailPlaceholder')}
                      disabled
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditOpen(false)}
                    >
                      {t('default.cancel')}
                    </Button>
                    <Button type="submit" className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {t('profile.form.saveInfo')}
                    </Button>
                  </div>
                </Form>
                {file && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleSaveAvatar(file)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {t('profile.avatar')}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Bloco do perfil: avatar + nome + email */}
        <Card className="rounded-3xl border border-border/40 shadow-sm overflow-hidden">
          <CardContent className="pt-8 pb-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-border/60 bg-muted">
                  {userLocal?.details.avatar ? (
                    <img
                      src={userLocal.details.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                  aria-label={t('profile.editProfile')}
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {userLocal?.displayName ?? '—'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {userLocal?.email ?? '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Métricas em linha (Dias de uso | Receitas | Despesas) */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="rounded-2xl border border-border/40 bg-card/80 text-center overflow-hidden"
            >
              <CardContent className="px-3 py-4">
                <p
                  className={cn(
                    'text-lg font-semibold tabular-nums',
                    stat.className
                  )}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sobre mim */}
        <section>
          <h3 className="text-base font-semibold text-foreground mb-2">
            {t('profile.aboutMe')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('profile.aboutMeDescription')}
          </p>
        </section>

        {/* Lista de opções (escalável) */}
        <div className="space-y-3">
          <ProfileMenuItem
            icon={<User className="h-5 w-5" />}
            title={t('profile.personalInfo')}
            description={t('profile.aboutMeDescription')}
            onClick={() => setEditOpen(true)}
          />
          {userLocal?.details?.provider === AccountProviders.EMAIL && (
            <ProfileMenuItem
              icon={<Lock className="h-5 w-5" />}
              title={t('profile.changePass')}
              description={t('profile.changePassDescription')}
              onClick={() => setPasswordOpen(true)}
            />
          )}
        </div>

        {/* Sheet: Alterar senha */}
        <Sheet open={passwordOpen} onOpenChange={setPasswordOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-md flex flex-col"
          >
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t('profile.changePass')}
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-6">
              <Form
                form={passForm}
                onSubmit={handleChangePassword}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('profile.form.passwordLabel')}</Label>
                  <PasswordInput
                    type="password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    name="currentPassword"
                    control={passForm.control}
                    placeholder={t('profile.form.passwordPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('profile.form.newPassword')}</Label>
                  <PasswordInput
                    type="password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    name="newPassword"
                    control={passForm.control}
                    placeholder={t('profile.form.newPasswordPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('profile.form.confirmPass')}</Label>
                  <PasswordInput
                    type="password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    name="confirmPassword"
                    control={passForm.control}
                    placeholder={t('profile.form.confirmPassPlaceholder')}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPasswordOpen(false)}
                  >
                    {t('default.cancel')}
                  </Button>
                  <Button type="submit" className="flex-1">
                    <Lock className="w-4 h-4 mr-2" />
                    {t('profile.changePass')}
                  </Button>
                </div>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </PrivateLayout>
  );
};

export default ProfilePage;
