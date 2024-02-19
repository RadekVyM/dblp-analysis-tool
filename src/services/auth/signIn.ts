import 'server-only'
import { unauthorizedError } from '@/utils/errors'
import { anyKeys } from '@/utils/objects'
import { isNullOrWhiteSpace } from '@/utils/strings'
import signInValidator from '@/validation/signInValidator'
import connectDb from '@/db/mongodb'
import User, { UserSchema } from '@/db/models/User'
import bcrypt from 'bcrypt'
import { updateSession } from './session'

/**
 * Signs a user in. Can be called only on the server.
 * @param email User's email
 * @param password User's password
 */
export default async function singIn(email: string, password: string) {
    if (isNullOrWhiteSpace(email) || isNullOrWhiteSpace(password)) {
        throw unauthorizedError('Please enter an e-mail and password.');
    }

    const err = signInValidator({ email, password });

    if (anyKeys(err)) {
        throw unauthorizedError('The values you entered are not valid.');
    }

    try {
        const user = await findMatchingUser(email, password);
        await updateSession(user.username, user.email);
    }
    catch (err) {
        throw unauthorizedError('An account matching the e-mail and password you entered couldn\'t be found. Please check your e-mail and password and try again.');
    }
}

/** Returns a user that matches the email and password. */
async function findMatchingUser(email: string, password: string) {
    await connectDb();

    const user = await User.findOne<UserSchema>({ email: email });

    if (!user?.passwordHash) {
        throw unauthorizedError('A user matching the e-mail and password couldn\'t be found.');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        throw unauthorizedError('A user matching the e-mail and password couldn\'t be found.');
    }

    return { id: user._id.toString(), name: user.username, username: user.username, email: user.email }
}