import User, { UserSchema } from '@/db/models/User'
import connectDb from '@/db/mongodb'
import { anyKeys } from '@/utils/objects'
import { isNullOrWhiteSpace } from '@/utils/strings'
import signUpValidator from '@/validation/signUpValidator'
import bcrypt from 'bcrypt'
import 'server-only'
import hasPassword from './hashPassword'

const SALT_ROUNDS = 10;

export async function signUp(email: string, username: string, password: string, confirmPassword: string) : Promise<UserSchema> {
    const err = signUpValidator({ email, username, password, confirmPassword });

    if (anyKeys(err)) {
        throw new Error('The values you entered are not valid.');
    }

    await connectDb();

    const user = await User.findOne<UserSchema>({ email: email });

    if (user) {
        throw new Error('User with this e-mail already exists.');
    }
    if (isNullOrWhiteSpace(password)) {
        throw new Error('Password cannot be empty.');
    }
    if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
    }

    const passwordHash = await hasPassword(password);

    const newUser = await User.create<UserSchema>({
        email: email.trim(),
        username: username.trim(),
        passwordHash: passwordHash
    });

    return newUser
}