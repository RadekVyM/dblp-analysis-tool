import { z } from 'zod'
import { UsernameSchema } from './UsernameSchema'

/** Schema for validating user info change form inputs. */
export const ChangeUserInfoSchema = z.object({
    email: z.string().email(),
    username: UsernameSchema
});

/** User info change form inputs. */
export type ChangeUserInfoInputs = z.infer<typeof ChangeUserInfoSchema>