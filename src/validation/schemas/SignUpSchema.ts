import { z } from 'zod'

export const SignUpSchema = z.object({
    email: z.string().min(1).email(),
    username: z.string().min(1),
    password: z.string().min(8),
});

export type SignUpInputs = z.infer<typeof SignUpSchema>