import { z } from 'zod'
import { UsernameSchema } from './UsernameSchema'

export const ChangeUserInfoSchema = z.object({
    email: z.string().email(),
    username: UsernameSchema
});

export type ChangeUserInfoInputs = z.infer<typeof ChangeUserInfoSchema>