
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Lock, Save, Crown, ArrowRight, LockIcon, Construction, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PrivateLayout from '../../layout/PrivateLayout';
import PageShell from '@/subdomains/backoffice/components/PageShell';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input, PasswordInput } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { AuthProvider, FireStore } from '@/utils/services/api/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { AccountProviders } from '@/types/enums/AccountProviders';
import useUserStore from '@/store/UserStore';
import { useGetUserData } from '@/utils/services/api/auth';
import AvatarTrigger from '@/components/AvatarTrigger';
import ImageDropzone from '@/components/Dropzone';
import axios from "axios";
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useTranslation } from 'react-i18next';

const initialNameForm = {
  name: "",
  email: "",
}

const initialPassForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
}

const BackOfficeProfilePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user: userLocal } = useUser()
  const { uid } = useUserStore();
  const { refetch } = useGetUserData(uid);
  const [file, setFile] = React.useState<File | null>(null);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const nameForm = useForm({
    defaultValues: initialNameForm
  })

  const passForm = useForm({
    defaultValues: initialPassForm
  })

  const handleSaveProfile = async (data: typeof initialNameForm) => {
    const { name } = data;
    const firstName = name.trim().split(" ")[0] || "";
    const lastName = name.trim().split(" ").slice(1).join(" ") || "";
    try {
      const userRef = doc(FireStore, "users", userLocal.uid);

      await updateDoc(userRef, {
        firstName,
        lastName,
        displayName: name,
        fullName: name,
        updatedAt: new Date(),
      });

      toast({
        title: t('profile.toast.success'),
        description: t('profile.toast.successDescription'),
      });
      refetch();
    } catch (error) {
      toast({
        title: t('profile.toast.errorTitle'),
        description: t('profile.toast.errorDescription'),
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (data: typeof initialPassForm) => {
    if (userLocal?.provider !== AccountProviders.EMAIL) return;
    if (passForm.getValues('newPassword') !== passForm.getValues('confirmPassword')) {
      toast({
        title: t('toast.error'),
        description: t('profile.toast.passwordDescription'),
        variant: "destructive",
      });
      return;
    }

    const user = AuthProvider.currentUser;
    if (!user || !user.email) {
      toast({
        title: t('toast.error'),
        description: t('profile.toast.userAuth'),
        variant: "destructive",
      })
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential).catch((err) => {
        toast({
          title: t('toast.warningTitle'),
          description: t('profile.toast.passwordErrorDescription'),
        })

        return;
      });

      await updatePassword(user, data.newPassword).catch((err) => {
        console.error("Erro ao atualizar senha:", err);
        toast({
          title: t('profile.toast.passwordErrorTitle'),
          description: err.message || t('toast.tryAgain'),
          variant: "destructive",
        });
        return;
      });
      toast({
        title: t('profile.toast.passwordSuccess'),
        description: t('profile.toast.passwordSuccessDescription'),
      });
      passForm.reset();
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      toast({
        title: t('profile.toast.passwordErrorTitle'),
        description: error.message || t('toast.tryAgain'),
        variant: "destructive",
      });
    }

    toast({
      title: t('profile.toast.passwordSuccess'),
      description: t('profile.toast.passwordSuccessDescription'),
    });
    passForm.reset();
  };

  const handleSaveAvatar = async (data: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'meu_troco';
    if (!cloudName || !apiKey) {
      toast({ title: t('profile.toast.avatarError'), description: t('profile.toast.errorDescription'), variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", data);
      formData.append("api_key", apiKey);
      formData.append("upload_preset", uploadPreset);
      formData.append("filename_override", `${uid}_${Date.now()}`);
      formData.append("public_id", `meu_troco/avatars/${uid}_${Date.now()}`);
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      if (response.status !== 200) throw new Error("Erro ao fazer upload da imagem");
      const userRef = doc(FireStore, "users", userLocal.uid);
      await updateDoc(userRef, {
        photoUrl: response.data.secure_url,
        updatedAt: new Date(),
      });
      toast({
        title: t('profile.toast.avatarSuccess'),
        description: t('profile.toast.avatarSuccessDescription'),
      });
      refetch();
    } catch (error) {
      toast({
        title: t('profile.toast.avatarError'),
        description: t('profile.toast.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    if (userLocal) {
      nameForm.reset({
        name: userLocal.displayName,
        email: userLocal.email
      })
    }
  }, [nameForm, userLocal]);

  const handleUpgrade = () => {
    navigate('/app/payments');
  };

  return (
    <PrivateLayout>
      <PageShell
        title={t('sidebar.profile')}
        description={t('profile.description')}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/80 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('profile.personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form form={nameForm} onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('signIn.nameLabel')}</Label>
                  <Input
                    leftIcon={<User className="w-4 h-4" />}
                    type="text"
                    name="name"
                    disabled={userLocal?.provider !== AccountProviders.EMAIL}
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
                <Button type="submit" className="w-full" disabled={userLocal?.provider !== AccountProviders.EMAIL}>
                  <Save className="w-4 h-4 mr-2" />
                  {t('profile.form.saveInfo')}
                </Button>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {t('profile.changePass')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form form={passForm} onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('profile.form.passwordLabel')}</Label>
                  <PasswordInput
                    type="password"
                    leftIcon={<LockIcon className='w-4 h-4' />}
                    name="currentPassword"
                    control={passForm.control}
                    placeholder={t('profile.form.passwordPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('profile.form.newPassword')}</Label>
                  <PasswordInput
                    type="password"
                    leftIcon={<LockIcon className='w-4 h-4' />}
                    name="newPassword"
                    control={passForm.control}
                    placeholder={t('profile.form.newPasswordPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('profile.form.confirmPass')}</Label>
                  <PasswordInput
                    type="password"
                    leftIcon={<LockIcon className='w-4 h-4' />}
                    name="confirmPassword"
                    control={passForm.control}
                    placeholder={t('profile.form.confirmPassPlaceholder')}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  {t('profile.changePass')}
                </Button>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 md:grid-cols-2 col-span-2'>
          <Card className="border-border/80 bg-card shadow-sm">
            <CardHeader className='flex flex-col gap-1 items-center justify-center'>
              {t('profile.avatar')}
              <span className='text-xs text-muted-foreground'>{t('profile.avatarDescription')}</span>
            </CardHeader>
            <CardContent className='flex flex-col gap-3 justify-center items-center'>
              <ImageDropzone
                setFile={setFile}
                initialImage={userLocal?.photoUrl}
              />

              <Button className='w-[90%] px-10' onClick={() => handleSaveAvatar(file)} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {t('default.save')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    </PrivateLayout>
  );
};

export default BackOfficeProfilePage;
