import { z } from 'zod'
import { PasswordSchema } from './PasswordSchema'

export const ChangePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: PasswordSchema,
    confirmNewPassword: z.string()
})
.refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match.',
    path: ['confirmNewPassword'],
});

export type ChangePasswordInputs = z.infer<typeof ChangePasswordSchema>