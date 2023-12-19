import { z } from 'zod'
import { PasswordSchema } from './PasswordSchema'
import { UsernameSchema } from './UsernameSchema'

/** Schema for validating user sign up form inputs. */
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

/** User sign up form inputs. */
export type SignUpInputs = z.infer<typeof SignUpSchema>