
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Lock, Save, Crown, ArrowRight, LockIcon } from 'lucide-react';
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
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
      });
      refetch();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao salvar perfil",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (data: typeof initialPassForm) => {
    if (userLocal?.provider !== AccountProviders.EMAIL) return;
    if (passForm.getValues('newPassword') !== passForm.getValues('confirmPassword')) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    const user = AuthProvider.currentUser;
    if (!user || !user.email) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      })
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential).catch((err) => {
        toast({
          title: "Atenção",
          description: "Senha Incorreta, Verifique se suas credenciais estão corretas.",
        })

        return;
      });

      await updatePassword(user, data.newPassword).catch((err) => {
        console.error("Erro ao atualizar senha:", err);
        toast({
          title: "Erro ao alterar senha",
          description: err.message || "Tente novamente.",
          variant: "destructive",
        });
        return;
      });
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso!",
      });
      passForm.reset();
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }

    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso!",
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
        title: "Avatar atualizado",
        description: "Seu avatar foi atualizado com sucesso!",
      });
      refetch();
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
      toast({
        title: "Erro ao atualizar avatar",
        description: "Tente novamente mais tarde.",
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
              <h1 className="text-3xl font-bold">Perfil</h1>
              <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
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
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form form={nameForm} onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    leftIcon={<User className="w-4 h-4" />}
                    type="text"
                    name="name"
                    disabled={userLocal?.provider !== AccountProviders.EMAIL}
                    placeholder="Seu nome completo"
                    control={nameForm.control}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    leftIcon={<Mail className="w-4 h-4" />}
                    type="email"
                    name="email"
                    control={nameForm.control}
                    placeholder="seu.email@exemplo.com"
                    disabled
                  />
                </div>
                <Button type="submit" className="w-full" disabled={userLocal?.provider !== AccountProviders.EMAIL}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Informações
                </Button>
              </Form>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form form={passForm} onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Sua Senha</Label>
                  <PasswordInput
                    type="password"
                    leftIcon={<LockIcon className='w-4 h-4' />}
                    name="currentPassword"
                    control={passForm.control}
                    placeholder="Digite sua a senha"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <PasswordInput
                    type="password"
                    leftIcon={<LockIcon className='w-4 h-4' />}
                    name="newPassword"
                    control={passForm.control}
                    placeholder="Digite sua nova senha"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <PasswordInput
                    type="password"
                    leftIcon={<LockIcon className='w-4 h-4' />}
                    name="confirmPassword"
                    control={passForm.control}
                    placeholder="Confirme sua nova senha"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Senha
                </Button>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <Card className='glass-card '>
            <CardHeader className='flex flex-col gap-1 items-center justify-center'>
              Foto de Perfil
              <span className='text-xs text-muted-foreground'>Clique ou arraste para alterar sua foto de perfil</span>
            </CardHeader>
            <CardContent className='flex flex-col gap-3 justify-center items-center'>
              <ImageDropzone
                setFile={setFile}
                initialImage={userLocal?.photoUrl}
              />

              <Button className='w-[90%] px-10' onClick={() => handleSaveAvatar(file)}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Estatísticas da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">15</p>
                  <p className="text-sm text-muted-foreground">Dias de uso</p>
                </div>
                <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-400">12</p>
                  <p className="text-sm text-muted-foreground">Receitas</p>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">8</p>
                  <p className="text-sm text-muted-foreground">Despesas</p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">
                    {isPremium ? "∞" : "42"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPremium ? "Transações" : "Restantes"}
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
