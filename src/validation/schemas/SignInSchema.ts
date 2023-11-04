import { z } from 'zod'

export const SignInSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export type SignInInputs = z.infer<typeof SignInSchema>