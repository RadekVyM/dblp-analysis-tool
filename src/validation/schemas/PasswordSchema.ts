import { z } from 'zod'

/** Schema for validating password form input. */
export const PasswordSchema = z
    .string()
    .min(8)
    .refine((value) =>
        /^(?=.*\p{Ll})(?=.*\p{Lu})(?=.*[\d|~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_])[\p{L}\d~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_]{8,}$/gmu.test(value),
        'Password must be at least 8 characters long and contain uppercase and lowercase letters and a numeric or special symbol.');
