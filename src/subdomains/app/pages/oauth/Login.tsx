import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, DollarSign, Lock, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@radix-ui/react-select';
import PublicLayout from '../../layout/PublicLayout';
import GoogleAuth from '../../components/GoogleAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Input, PasswordInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { LoginForm } from '@/types/validation/login';
import { useLoginWithEmail } from '@/utils/api/auth';
import { Form } from '@/components/ui/form';
import useUserStore from '@/store/UserStore';

const initialValues: LoginForm = {
  email: "",
  password: ""
}

const LoginPage = () => {
  const navigate = useNavigate();
  const loginForm = useForm<LoginForm>({
    defaultValues: initialValues,
  })
  const mutate = useLoginWithEmail();
  const { setUid } = useUserStore()
  const handleSubmit = (data: LoginForm) => {
    mutate.mutate(data, {
      onSuccess: ({ uid }) => {
        toast({
          title: "Bem-vindo de volta!",
          description: " Vocé fez login com sucesso.",
        })
        setUid(uid)
        navigate("/dashboard", { replace: true });
      },
      onError: () => {
        toast({
          title: "Erro ao fazer login",
          description: "Ocorreu um erro ao fazer o login, verifique se suas credenciais estão corretas.",
          variant: "destructive"
        })
      }
    })
  }

  return (
    <PublicLayout type='simple'>
      <div className="flex items-center justify-center bg-gradient-to-br from-background via-background to-emerald-950/20 p-4">
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
              <Form form={loginForm} onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    leftIcon={<Mail className='w-5 h-5' />}
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    control={loginForm.control}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <PasswordInput
                    leftIcon={<Lock className='w-5 h-5' />}
                    type="password"
                    name="password"
                    placeholder="Digite sua Senha"
                    control={loginForm.control}
                    className="bg-background/50"
                  />
                </div>

                {mutate.error && (
                  <div className="flex items-center space-x-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{mutate.error.message}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={mutate.isPending}
                >
                  {mutate.isPending ? 'Carregando...' : 'Acessar'}
                </Button>
              </Form>


              <div className='flex flex-row justify-center items-center gap-2 mt-5'>
                <span>Não tem uma conta?</span>
                <Link to="/oauth/register" className='text-primary hover:underline'>
                  Crie uma aqui
                </Link>
              </div>
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
