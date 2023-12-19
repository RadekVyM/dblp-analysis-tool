import { SignUpInputs, SignUpSchema } from './schemas/SignUpSchema'

/**
 * Validates all values of user sign up form inputs.
 * @param values User sign up form inputs.
 * @returns An empty object, if succeeds, otherwise an object containing error messages.
 */
export default function signUpValidator(values: SignUpInputs): object {
    const result = SignUpSchema.safeParse(values);
    return result.success ? {} : result.error.format()
}