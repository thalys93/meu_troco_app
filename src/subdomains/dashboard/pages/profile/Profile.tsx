import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Pencil, Lock, Cog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PrivateLayout from '../../layout/PrivateLayout';
import { useForm } from 'react-hook-form';
import ProfileMenuSheet from './components/profile-menu-sheet';
import ProfileForm from './components/profile-form';
import ProfilePasswordForm from './components/profile-password-form';
import ProfileSettingsForm from './components/profile-settings-form';
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

const initialNameForm = {
  name: '',
  email: '',
};

const initialPassForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const initialSettingsForm = {
  emailNotifications: true,
  pushNotifications: true,
  monthlyReports: false,
};

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
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const settingsForm = useForm({
    defaultValues: initialSettingsForm,
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

  const handleSaveSettings = async (data: typeof initialSettingsForm) => {
    try {
      const userRef = doc(FireStore, 'users', userLocal.uid);

      await updateDoc(userRef, {
        preferences: {
          emailNotifications: data.emailNotifications,
          pushNotifications: data.pushNotifications,
          monthlyReports: data.monthlyReports,
          updatedAt: new Date(),
        },
      });

      toast({
        title: t('profile.toast.settingsSuccess'),
        description: t('profile.toast.settingsSuccessDescription'),
        variant: 'success',
      });
      refetch();
      setSettingsOpen(false);
    } catch (error) {
      toast({
        title: t('profile.toast.settingsError'),
        description: t('profile.toast.settingsErrorDescription'),
        variant: 'destructive',
      });
      console.log(error);
    }
  };

  useEffect(() => {
    if (userLocal) {
      nameForm.reset({
        name: userLocal.displayName,
        email: userLocal.email ?? '',
      });

      const userPreferences = (userLocal as any).preferences;
      if (userPreferences) {
        settingsForm.reset({
          emailNotifications: userPreferences.emailNotifications ?? true,
          pushNotifications: userPreferences.pushNotifications ?? true,
          monthlyReports: userPreferences.monthlyReports ?? false,
        });
      }
    }
  }, [nameForm, settingsForm, userLocal]);

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
    <PrivateLayout>
      <div className="mx-auto w-full max-w-xl mt-4 md:mt-6 px-4 md:px-6 space-y-6 pb-28">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('sidebar.profile')}
          </h1>
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
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
            aria-label={t('profile.editProfile')}
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

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

        <section>
          <h3 className="text-base font-semibold text-foreground mb-2">
            {t('profile.aboutMe')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('profile.aboutMeDescription')}
          </p>
        </section>

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
              iconClassName='text-sky-500 bg-sky-500/10'
            />
          )}

          <ProfileMenuItem
            icon={<Cog className="h-5 w-5" />}
            title={t('sidebar.settings')}
            description={t('sidebar.settingsDescription')}
            onClick={() => setSettingsOpen(true)}
            iconClassName='text-yellow-400 bg-yellow-400/10'
            isDisabled={true}
          />
        </div>

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

        <ProfileMenuSheet
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          title={t('sidebar.settings')}
          titleIcon={<Cog className="h-5 w-5" />}
        >
          <ProfileSettingsForm
            form={settingsForm}
            onSubmit={handleSaveSettings}
            onCancel={() => setSettingsOpen(false)}
            t={t}
          />
        </ProfileMenuSheet>
      </div>
    </PrivateLayout>
  );
};

export default ProfilePage;
