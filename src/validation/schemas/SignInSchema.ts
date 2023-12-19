import { z } from 'zod'

/** Schema for validating user sign in form inputs. */
export const SignInSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

/** User sign in form inputs. */
export type SignInInputs = z.infer<typeof SignInSchema>