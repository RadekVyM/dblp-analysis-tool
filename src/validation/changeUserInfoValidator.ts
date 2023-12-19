import { ChangeUserInfoInputs, ChangeUserInfoSchema } from './schemas/ChangeUserInfoSchema'

/**
 * Validates all values of user info change form inputs.
 * @param values User info change form inputs.
 * @returns An empty object, if succeeds, otherwise an object containing error messages.
 */
export default function changeUserInfoValidator(values: ChangeUserInfoInputs): object {
    const result = ChangeUserInfoSchema.safeParse(values);
    return result.success ? {} : result.error.format()
}