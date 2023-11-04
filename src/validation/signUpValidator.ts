import { SignUpInputs, SignUpSchema } from './schemas/SignUpSchema'

export default function signUpValidator(values: SignUpInputs) {
    const result = SignUpSchema.safeParse(values);
    return result.success ? {} : result.error.format()
}