import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string({required_error: "Email é obrigatório"}).email({message: "Email inválido"}),
    password: z.string({required_error: "Senha é obrigatória"}).min(8)
})

export type LoginForm = z.infer<typeof LoginSchema>