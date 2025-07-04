import React from 'react'
import PublicLayout from '../../layout/PublicLayout'
import { Label } from '@/components/ui/label'
import { Input, PasswordInput } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { AlertCircle, AlignLeft, DollarSign, Lock, Mail, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { SignUpForm, SignUpSchema } from '@/types/validation/signUp'
import { useCreateWithEmail, useLoginWithEmail } from '@/utils/api/auth'
import { Checkbox } from '@/components/ui/checkbox'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/hooks/use-toast'
import { passwordRules } from '@/utils/helpers/formRules'
import useUserStore from '@/store/UserStore'

const initialValues: SignUpForm = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    checkedTerms: false
}

function RegisterPage() {
    const signInForm = useForm<SignUpForm>({
        defaultValues: initialValues,
        resolver: zodResolver(SignUpSchema)
    })

    const {setUid} = useUserStore()

    const handleCreate = useCreateWithEmail();
    const handleLogin = useLoginWithEmail();
    const passwordValue = signInForm.watch("password");
    const navigate = useNavigate();

    const handleSubmit = (data: SignUpForm) => {
        if (data.checkedTerms === false) {
            toast({
                title: "Atenção",
                description: "Por favor, aceite os termos e condições.",
                variant: "info"
            })
            return;
        }

        if (data.password !== data.confirmPassword) {
            toast({
                title: "Atenção",
                description: "As senhas devem ser iguais.",
                variant: "info"
            })
            return;
        }

        handleCreate.mutate({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password
        }, {
            onSuccess: () => {
                toast({
                    title: "Parabéns",
                    description: "Cadastro realizado com sucesso.",
                })

                handleLogin.mutate({
                    email: data.email,
                    password: data.password
                }, {
                    onSuccess: ({uid}) => {
                        toast({
                            title: "Bem-vindo!",
                            description: " Vocé fez login com sucesso.",
                        })

                        setUid(uid)
                        navigate("/dashboard")
                    },

                    onError: () => {
                        toast({
                            title: "Erro ao fazer login",
                            description: "Ocorreu um erro ao fazer o login.",
                            variant: "destructive"
                        })
                        navigate("/oauth/login")
                    }
                })
            },
            onError: () => {
                toast({
                    title: "Erro ao cadastrar",
                    description: "Ocorreu um erro ao cadastrar, tente novamente mais tarde.",
                    variant: "destructive"
                })
            }
        })
    }

    const PasswordChecklist = ({ password }: { password: string }) => {
        const checks = {
            upper: passwordRules.upper.test(password),
            lower: passwordRules.lower.test(password),
            number: passwordRules.number.test(password),
            special: passwordRules.special.test(password),
            minLength: passwordRules.minLength.test(password)
        }

        return (
            <ul className='text-sm mt-2 space-y-1 grid grid-cols-2'>
                <li className={checks.upper ? "text-green-500" : "text-red-500"}>1 letra maiúscula</li>
                <li className={checks.lower ? "text-green-500" : "text-red-500"}>1 letra minúscula</li>
                <li className={checks.number ? "text-green-500" : "text-red-500"}>1 número</li>
                <li className={checks.special ? "text-green-500" : "text-red-500"}>1 caractere especial</li>
                <li className={checks.minLength ? "text-green-500" : "text-red-500"}>8 ou mais caracteres</li>
            </ul>
        )
    }

    return (
        <PublicLayout type="simple">
            <div className="flex items-center justify-center bg-gradient-to-br from-background via-background to-emerald-950/20 p-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                                <User className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Novo Usuário</h1>
                        <p className="text-muted-foreground mt-2">Crie sua conta para continuar</p>
                    </div>

                    <Card className="glass-card">
                        <CardHeader className="space-y-2 mb-0 pb-0">
                            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
                            <CardDescription>
                                Insira seus dados para criar sua conta
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form form={signInForm} onSubmit={handleSubmit} className="grid grid-cols-2 space-y-4 items-center justify-center gap-3">
                                <div className='col-span-2 md:col-span-1 mt-auto space-y-2 md:mt-4'>
                                    <Label htmlFor='lastName'>Nome</Label>
                                    <Input
                                        leftIcon={<AlignLeft className='w-5 h-5' />}
                                        type="text"
                                        name="firstName"
                                        placeholder="John"
                                        control={signInForm.control}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>

                                <div className='col-span-2 md:col-span-1 mt-auto space-y-2'>
                                    <Label htmlFor='lastName'>Sobre Nome</Label>
                                    <Input
                                        leftIcon={<AlignLeft className='w-5 h-5' />}
                                        type="text"
                                        name="lastName"
                                        placeholder="Doe"
                                        control={signInForm.control}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        leftIcon={<Mail className='w-5 h-5' />}
                                        type="email"
                                        name="email"
                                        placeholder="john@example.com"
                                        control={signInForm.control}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <PasswordInput
                                        leftIcon={<Lock className='w-5 h-5' />}
                                        type="password"
                                        name="password"
                                        placeholder="Digite sua Senha"
                                        control={signInForm.control}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="password">Confirme sua Senha</Label>
                                    <PasswordInput
                                        leftIcon={<Lock className='w-5 h-5' />}
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirme sua Senha"
                                        control={signInForm.control}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="password" className='text-foreground'>A Senha deve ter:</Label>
                                    <PasswordChecklist password={passwordValue} />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="password">Termos de Uso</Label>
                                    <div className="flex items-center space-x-2 py-2">
                                        <Checkbox
                                            name="checkedTerms"
                                            onCheckedChange={(checked) => signInForm.setValue("checkedTerms", checked ? true : false)}
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            Aceito os <Link to="#" className='text-primary hover:underline transition-all'>termos de uso</Link> e {" "}
                                            <Link to="#" className='text-primary hover:underline transition-all'>politica de privacidade</Link>
                                        </span>
                                    </div>
                                </div>

                                {handleCreate.error && (
                                    <div className="flex items-center space-x-2 text-destructive text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{handleCreate.error.message}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 col-span-2"
                                    disabled={handleCreate.isPending}
                                >
                                    {handleCreate.isPending ? 'Carregando...' : 'Cadastrar'}
                                </Button>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PublicLayout>
    )
}


export default RegisterPage
