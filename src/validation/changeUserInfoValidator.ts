import { ChangeUserInfoInputs, ChangeUserInfoSchema } from './schemas/ChangeUserInfoSchema'

export default function changeUserInfoValidator(values: ChangeUserInfoInputs) {
    const result = ChangeUserInfoSchema.safeParse(values);
    return result.success ? {} : result.error.format()
}