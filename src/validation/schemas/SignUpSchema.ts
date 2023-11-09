import { z } from 'zod'
import { PasswordSchema } from './PasswordSchema'
import { UsernameSchema } from './UsernameSchema';

export const SignUpSchema = z.object({
    email: z.string().min(1).email(),
    username: UsernameSchema,
    password: PasswordSchema,
    confirmPassword: z.string()
})
.refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
});

export type SignUpInputs = z.infer<typeof SignUpSchema>