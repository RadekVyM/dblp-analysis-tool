import { anyKeys } from '@/utils/objects'
import changeUserInfoValidator from '@/validation/changeUserInfoValidator'
import 'server-only'
import getCurrentUser from './getCurrentUser'
import connectDb from '@/db/mongodb'
import User, { UserSchema } from '@/db/models/User'
import { badRequestError, unauthorizedError } from '@/utils/errors'

export async function changeUserInfo(email: string, username: string) : Promise<UserSchema | null> {
    const err = changeUserInfoValidator({ email, username });

    if (anyKeys(err)) {
        throw badRequestError('The values you entered are not valid.');
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
        throw unauthorizedError('You need to be signed in to change your profile information.');
    }

    await connectDb();

    const user = await User.findOne<UserSchema>({ email: email });

    if (user && user._id.toString() !== currentUser._id.toString()) {
        throw unauthorizedError('Invalid e-mail address.');
    }
    
    const updatedUser = await User.findByIdAndUpdate<UserSchema>(currentUser._id, {
        email: email.trim(),
        username: username.trim()
    });

    if (!updatedUser) {
        throw unauthorizedError('User could not be updated.');
    }

    return await User.findById<UserSchema>(updatedUser._id)
}