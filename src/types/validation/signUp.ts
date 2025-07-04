import {z} from "zod";

export const SignUpSchema = z.object({    
    email: z.string().email({message: "Email inválido"}),
    password: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/, {message: "Senha inválida"}),    
    confirmPassword: z.string(),    
})

export type SignUpForm = z.infer<typeof SignUpSchema>