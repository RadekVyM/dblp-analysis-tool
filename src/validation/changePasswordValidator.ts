import { ChangePasswordInputs, ChangePasswordSchema } from './schemas/ChangePasswordSchema'

export default function changePasswordValidator(values: ChangePasswordInputs) {
    const result = ChangePasswordSchema.safeParse(values);
    return result.success ? {} : result.error.format()
}