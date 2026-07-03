import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "O email é obrigatório").email("Email inválido"),
  password: z.string().min(1, "A password é obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().min(1, "O email é obrigatório").email("Email inválido"),
  password: z.string().min(6, "A password deve ter pelo menos 6 caracteres"),
  termsAccepted: z
    .boolean()
    .refine((v) => v === true, "Tens de aceitar os Termos de Uso para continuar"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
