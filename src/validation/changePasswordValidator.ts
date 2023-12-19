import { ChangePasswordInputs, ChangePasswordSchema } from './schemas/ChangePasswordSchema'

/**
 * Validates all values of password change form inputs.
 * @param values Password change form inputs.
 * @returns An empty object, if succeeds, otherwise an object containing error messages.
 */
export default function changePasswordValidator(values: ChangePasswordInputs): object {
    const result = ChangePasswordSchema.safeParse(values);
    return result.success ? {} : result.error.format()
}