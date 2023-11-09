import { anyKeys } from '@/utils/objects'
import changeUserInfoValidator from '@/validation/changeUserInfoValidator'
import 'server-only'
import getCurrentUser from './getCurrentUser'
import connectDb from '@/db/mongodb'
import User, { UserSchema } from '@/db/models/User'

export async function changeUserInfo(email: string, username: string) : Promise<UserSchema | null> {
    const err = changeUserInfoValidator({ email, username });

    if (anyKeys(err)) {
        throw new Error('The values you entered are not valid.');
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
        throw new Error('You need to be signed in to change your profile information.');
    }

    await connectDb();

    const user = await User.findOne<UserSchema>({ email: email });

    if (user && user._id.toString() !== currentUser._id.toString()) {
        throw new Error('User with this e-mail already exists.');
    }
    
    const updatedUser = await User.findByIdAndUpdate<UserSchema>(currentUser._id, {
        email: email.trim(),
        username: username.trim()
    });

    if (!updatedUser) {
        throw new Error('User could not be updated.');
    }

    return await User.findById<UserSchema>(updatedUser._id)
}