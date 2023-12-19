import User, { UserSchema } from '@/db/models/User'
import connectDb from '@/db/mongodb'
import { anyKeys } from '@/utils/objects'
import { isNullOrWhiteSpace } from '@/utils/strings'
import signUpValidator from '@/validation/signUpValidator'
import 'server-only'
import hashPassword from './hashPassword'
import { badRequestError } from '@/utils/errors'

export async function signUp(email: string, username: string, password: string, confirmPassword: string) : Promise<UserSchema> {
    const err = signUpValidator({ email, username, password, confirmPassword });

    if (anyKeys(err)) {
        throw badRequestError('The values you entered are not valid.');
    }

    await connectDb();

    const user = await User.findOne<UserSchema>({ email: email });

    if (user) {
        throw badRequestError('Invalid e-mail address.');
    }
    if (isNullOrWhiteSpace(password)) {
        throw badRequestError('Password cannot be empty.');
    }
    if (password !== confirmPassword) {
        throw badRequestError('Passwords do not match.');
    }

    const passwordHash = await hashPassword(password);

    const newUser = await User.create<UserSchema>({
        email: email.trim(),
        username: username.trim(),
        passwordHash: passwordHash
    });

    return newUser
}