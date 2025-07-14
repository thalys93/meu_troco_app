
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Lock, Save, Crown, ArrowRight, LockIcon, Construction } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PrivateLayout from '../../layout/PrivateLayout';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input, PasswordInput } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { AuthProvider, FireStore } from '@/utils/api/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useUser } from '@/hooks/use-user';
import { AccountProviders } from '@/types/enums/AccountProviders';
import useUserStore from '@/store/UserStore';
import { useGetUserData } from '@/utils/api/auth';
import AvatarTrigger from '@/components/AvatarTrigger';
import ImageDropzone from '@/components/Dropzone';
import axios from "axios";
import { api } from '@/utils/api/api';
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

const ProfilePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user: userLocal } = useUser()
  const { uid } = useUserStore();
  const { refetch } = useGetUserData(uid);
  const [file, setFile] = React.useState<File | null>(null);
  const { t } = useTranslation();

  const {
    expenseLength,
    incomeLength,
    userJoinedTime,
    getDaysSinceUserCreated
  } = useDashboardStats()

  const nameForm = useForm({
    defaultValues: initialNameForm
  })

  const passForm = useForm({
    defaultValues: initialPassForm
  })

  const userPlan = userLocal?.accountType;
  const isPremium = {
    "BASIC": false,
    "ADMIN": true,
    "PREMIUM": true
  };

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
        title: "Erro",
        description: t('profile.toast.passwordDescription'),
        variant: "destructive",
      });
      return;
    }

    const user = AuthProvider.currentUser;
    if (!user || !user.email) {
      toast({
        title: "Erro",
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
    const query = new URLSearchParams({ id: uid, })
    const { data: config } = await api.get(`/cloudinary-signature?${query.toString()}`);
    const formData = new FormData();
    formData.append("file", data);
    formData.append("timestamp", config.timestamp.toString());
    formData.append("public_id", config.public_id);
    formData.append("signature", config.signature);
    formData.append("api_key", config.api_key);
    formData.append("uploud_preset", "meu_troco");
    const response = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, formData)
    if (response.status !== 200) throw new Error("Erro ao fazer upload da imagem");
    try {
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
      <div className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
        {/* Header com Status do Plano */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{t('sidebar.profile')}</h1>
              <p className="text-muted-foreground">{t('profile.description')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* <Badge
              variant={isPremium ? "default" : "outline"}
              className={isPremium ? "bg-primary" : "border-primary text-primary"}
            >
              {isPremium && <Crown className="w-3 h-3 mr-1" />}
              {userPlan}
            </Badge> */}
            {/* {!isPremium && (
              <Button onClick={handleUpgrade} size="sm" className="gap-2">
                <Crown className="w-4 h-4" />
                Fazer Upgrade
                <ArrowRight className="w-4 h-4" />
              </Button>
            )} */}
          </div>
        </div>

        {/* Card de Status do Plano */}
        {/* {!isPremium && (
          <Card className="glass-card border-primary/20 bg-gradient-to-r from-primary/5 to-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Desbloqueie Recursos Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Você está no plano <strong>{userPlan}</strong>. Faça upgrade para acessar:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <Crown className="w-3 h-3 text-primary" />
                      <span>Transações ilimitadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Crown className="w-3 h-3 text-primary" />
                      <span>Relatórios avançados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Crown className="w-3 h-3 text-primary" />
                      <span>Metas financeiras personalizadas</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">R$ 9,90</div>
                  <div className="text-xs text-muted-foreground mb-3">/mês</div>
                  <Button onClick={handleUpgrade} className="gap-2">
                    <Crown className="w-4 h-4" />
                    Fazer Upgrade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card">
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

          <Card className="glass-card">
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

        <div className='grid gap-6 md:grid-cols-2'>
          <Card className='glass-card '>
            <CardHeader className='flex flex-col gap-1 items-center justify-center'>
              {t('profile.avatar')}
              <span className='text-xs text-muted-foreground'>{t('profile.avatarDescription')}</span>
            </CardHeader>
            <CardContent className='flex flex-col gap-3 justify-center items-center'>
              <ImageDropzone
                setFile={setFile}
                initialImage={userLocal?.photoUrl}
              />

              <Button className='w-[90%] px-10' onClick={() => handleSaveAvatar(file)}>
                <Save className="w-4 h-4 mr-2" />
                {t('default.save')}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('profile.accountStats')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{getDaysSinceUserCreated(userJoinedTime)}</p>
                  <p className="text-sm text-muted-foreground">{t('profile.daysOfUse')}</p>
                </div>
                <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-400">{incomeLength}</p>
                  <p className="text-sm text-muted-foreground">{t('sidebar.income')}</p>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">{expenseLength}</p>
                  <p className="text-sm text-muted-foreground">{t('sidebar.expenses')}</p>
                </div>
                {/* <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">
                    {isPremium ? "∞" : "42"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPremium ? "Transações" : "Restantes"}
                  </p>
                </div> */}
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg select-none">
                  <p className="text-2xl font-bold text-yellow-400 flex items-center justify-center my-1">
                    {/* {isPremium ? "∞" : "42"} */}
                    <Construction />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPremium ? t('default.wip') : t('premium.remaining')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas do Usuário */}
      </div>
    </PrivateLayout>
  );
};

export default ProfilePage;
