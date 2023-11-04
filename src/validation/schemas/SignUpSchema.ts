import { isNullOrWhiteSpace } from '@/utils/strings';
import { z } from 'zod'

export const SignUpSchema = z.object({
    email: z.string().min(1).email(),
    username: z.string().min(1).refine((value) => !isNullOrWhiteSpace(value), 'Name cannot be empty.'),
    password: z.string().min(8).refine((value) => /^(?=.*\p{Ll})(?=.*\p{Lu})(?=.*[\d|~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_])[\p{L}\d~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_]{8,}$/gmu.test(value),
        'Password must be at least 8 characters long and contain uppercase and lowercase letters and a numeric or special symbol.'),
    confirmPassword: z.string()
})
.refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
});

export type SignUpInputs = z.infer<typeof SignUpSchema>