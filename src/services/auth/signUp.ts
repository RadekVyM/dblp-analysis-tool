import 'server-only'
import User, { UserSchema } from '@/db/models/User'
import connectDb from '@/db/mongodb'
import { anyKeys } from '@/utils/objects'
import { isNullOrWhiteSpace } from '@/utils/strings'
import signUpValidator from '@/validation/signUpValidator'
import hashPassword from './hashPassword'
import { badRequestError } from '@/utils/errors'

/**
 * Signs a new user up. Can be called only on the server.
 * @param email User's email
 * @param username Username
 * @param password User's password
 * @param confirmPassword Confirmation of the password
 * @returns User database object
 */
export default async function signUp(email: string, username: string, password: string, confirmPassword: string): Promise<UserSchema> {
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

    return newUser;
}