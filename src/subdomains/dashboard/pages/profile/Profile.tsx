import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Pencil, Lock, Cog, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PrivateLayout from '../../layout/PrivateLayout';
import { useForm } from 'react-hook-form';
import ProfileMenuSheet from './components/profile-menu-sheet';
import ProfileForm from './components/profile-form';
import ProfilePasswordForm from './components/profile-password-form';
import { AuthProvider, FireStore } from '@/utils/services/api/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { AccountProviders } from '@/types/enums/AccountProviders';
import { useUser } from '@/hooks/use-user';
import useUserStore from '@/store/UserStore';
import { useGetUserData } from '@/utils/services/api/auth';
import axios from 'axios';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useTranslation } from 'react-i18next';
import { FirebaseTimestamp } from '@/types/Firebase';
import { cn } from '@/lib/utils';
import ProfileMenuItem from './components/profile-menu-item';
import { UserRankProfileCard } from '@/components/rank/UserRankProfileCard';

const initialNameForm = {
  name: '',
  email: '',
};

const initialPassForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function ProfilePageBody() {
  const { toast } = useToast();
  const { user: userLocal } = useUser();
  const { uid } = useUserStore();
  const { refetch } = useGetUserData(uid);
  const [file, setFile] = useState<File | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const {
    expenseLength,
    incomeLength,
    billsLength,
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
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'meu_troco';
    if (!cloudName || !apiKey) {
      toast({ title: t('profile.toast.avatarError'), description: t('profile.toast.errorDescription'), variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', data);
      formData.append('api_key', apiKey);
      formData.append('upload_preset', uploadPreset);
      formData.append('filename_override', `${uid}`);
      formData.append('public_id', `meu_troco/avatars/${uid}_${Date.now()}`);
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      if (response.status !== 200) throw new Error('Erro ao fazer upload da imagem');
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
    } catch (error) {
      toast({
        title: t('profile.toast.avatarError'),
        description: t('profile.toast.errorDescription'),
        variant: 'destructive',
      });
    } finally {
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
    {
      value: billsLength,
      label: t('sidebar.bills'),
      className: 'text-amber-400',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl mt-4 md:mt-6 px-4 md:px-6 pb-28 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t('sidebar.profile')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="rounded-3xl border border-border/40 shadow-sm h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-primary" />
              {t('profile.identityTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/20 p-3 text-center"
              >
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
              </div>
            ))}
            </div>
          </CardContent>
        </Card>

        <UserRankProfileCard />

        <Card className="rounded-3xl border border-border/40 shadow-sm h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <LayoutGrid className="h-5 w-5 text-primary" />
              {t('profile.shortcuts.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('profile.shortcuts.description')}
            </p>
            <div className="grid grid-cols-1 gap-3">
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
                  iconClassName="text-sky-500 bg-sky-500/10"
                />
              )}
              <ProfileMenuItem
                icon={<Cog className="h-5 w-5" />}
                title={t('sidebar.settings')}
                description={t('settings.subtitle')}
                onClick={() => navigate('/dashboard/settings')}
                iconClassName="text-yellow-500 bg-yellow-500/10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfileMenuSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        title={t('profile.editProfile')}
      >
        <ProfileForm
          form={nameForm}
          onSubmit={handleSaveProfile}
          onCancel={() => setEditOpen(false)}
          file={file}
          setFile={setFile}
          onSaveAvatar={handleSaveAvatar}
          isLoading={isLoading}
          initialAvatar={userLocal?.details.avatar}
          t={t}
        />
      </ProfileMenuSheet>

      <ProfileMenuSheet
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        title={t('profile.changePass')}
        titleIcon={<Lock className="h-5 w-5" />}
      >
        <ProfilePasswordForm
          form={passForm}
          onSubmit={handleChangePassword}
          onCancel={() => setPasswordOpen(false)}
          t={t}
        />
      </ProfileMenuSheet>
    </div>
  );
}

const ProfilePage = () => (
  <PrivateLayout>
    <ProfilePageBody />
  </PrivateLayout>
);

export default ProfilePage;
