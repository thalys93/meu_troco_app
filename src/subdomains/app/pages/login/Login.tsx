/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, DollarSign, Lock, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@radix-ui/react-select';
import PublicLayout from '../../layout/PublicLayout';
import GoogleAuth from '../../components/GoogleAuth';
import { useNavigate } from 'react-router-dom';
import { getRedirectResult, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { User } from '@/types/entities/User';
import { AuthProvider } from '@/utils/api/firebase';
import { whitelist } from '@/utils/api/validation';
import { AccountTypes } from '@/types/enums/AccountsTypes';
import { Input, PasswordInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { handleUpdateUser } = useAuth()
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Por favor, preencha ambos email e senha');
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(AuthProvider, email, password);
      const resultUser = result.user;      
      const user: User = {
        uid: resultUser.uid,
        firstName: resultUser.displayName?.split(" ")[0] || "",
        lastName: resultUser.displayName?.split(" ").slice(1).join(" ") || "",
        displayName: resultUser.displayName || "",
        fullName: resultUser.displayName || "",
        email: resultUser.email || "",
        photoUrl: resultUser.photoURL || "",
        accountType: whitelist.includes(resultUser.email!) ? AccountTypes.ADMIN : AccountTypes.BASIC,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await handleUpdateUser(user);
      toast({
        title: "Bem-vindo de volta!",
        description: "Você fez login com sucesso.",
      });

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setLoading(false);      
      let msg = "Ocorreu um erro ao fazer login.";
      if (error.code === "auth/user-not-found") msg = "Usuário não encontrado.";
      else if (error.code === "auth/wrong-password") msg = "Senha incorreta.";
      else if (error.code === "auth/invalid-email") msg = "Email inválido.";

      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getRedirectResult(AuthProvider).then((result) => {
      if (result) {
        navigate("/dashboard", { replace: true });
      }
    })   
  },[])

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(AuthProvider, async (user) => {
      if (!user) return;      
      const newUser: User = {
        uid: user.uid,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        displayName: user.displayName || "",
        fullName: user.displayName || "",
        email: user.email || "",
        photoUrl: user.photoURL || "",
        accountType: whitelist.includes(user.email!) ? AccountTypes.ADMIN : AccountTypes.BASIC,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // handleUpdateUser(newUser)
      toast({
        title: "Bem-vindo de volta!",
        description: "Você fez login com sucesso.",
      });

      navigate("/dashboard");
    });

    return () => unsubscribe();
  }, []);

  return (
    <PublicLayout type='simple'>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-emerald-950/20 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Bem Vindo!</h1>
            <p className="text-muted-foreground mt-2">Entre ou crie sua conta para continuar</p>
          </div>

          <Card className="glass-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold">Log In</CardTitle>
              <CardDescription>
                Preencha seu Email e senha para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    leftIcon={<Mail className='w-5 h-5'/>}
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <PasswordInput
                    id="password"
                    leftIcon={<Lock className='w-5 h-5'/>}
                    type="password"
                    name="password"
                    placeholder="Digite sua Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : 'Acessar'}
                </Button>
              </form>


              <div className="mt-6 text-center text-sm text-muted-foreground">
                <span className='text-muted-foreground select-none opacity-70'>ou</span>
                <Separator className='my-4 h-0.5 bg-muted' />
                <GoogleAuth />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;
