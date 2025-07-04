import { z } from "zod";

export const SignUpSchema = z.object({
    firstName: z.string().min(1, { message: "Primeiro nome é obrigatório" }),
    lastName: z.string().min(1, { message: "Sobrenome é obrigatório" }),
    email: z.string({required_error: "Email é obrigatório"}).email({ message: "Email inválido" }),
    password: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/, { message: "Senha inválida" }),
    confirmPassword: z.string(),
    checkedTerms: z.boolean()
})

export type SignUpForm = z.infer<typeof SignUpSchema>