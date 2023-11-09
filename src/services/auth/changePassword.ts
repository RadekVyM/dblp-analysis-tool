import { anyKeys } from '@/utils/objects'
import changePasswordValidator from '@/validation/changePasswordValidator'
import getCurrentUser from './getCurrentUser'
import bcrypt from 'bcrypt'
import 'server-only'
import hasPassword from './hashPassword'
import connectDb from '@/db/mongodb'
import User, { UserSchema } from '@/db/models/User'

export default async function changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string) {
    const err = changePasswordValidator({ currentPassword, newPassword, confirmNewPassword });

    if (anyKeys(err)) {
        throw new Error('The values you entered are not valid.');
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
        throw new Error('You need to be signed in to change your profile information.');
    }

    const passwordMatch = await bcrypt.compare(currentPassword, currentUser.passwordHash);

    if (!passwordMatch) {
        throw new Error('Invalid current password has been entered.');
    }

    if (newPassword !== confirmNewPassword) {
        throw new Error('Passwords do not match.');
    }

    const passwordHash = await hasPassword(newPassword);
    
    await connectDb();

    const result = await User.findByIdAndUpdate<UserSchema>(currentUser._id, {
        passwordHash: passwordHash
    });
}