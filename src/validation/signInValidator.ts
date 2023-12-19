import { SignInInputs, SignInSchema } from './schemas/SignInSchema'

/**
 * Validates all values of user sign in form inputs.
 * @param values User sign in form inputs.
 * @returns An empty object, if succeeds, otherwise an object containing error messages.
 */
export default function signInValidator(values: SignInInputs): object {
    const result = SignInSchema.safeParse(values);
    return result.success ? {} : result.error.format()
}