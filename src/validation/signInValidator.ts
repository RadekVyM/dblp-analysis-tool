import { SignInInputs, SignInSchema } from './schemas/SignInSchema'

export default function signInValidator(values: SignInInputs) {
    const result = SignInSchema.safeParse(values);
    return result.success ? {} : result.error.format()
}