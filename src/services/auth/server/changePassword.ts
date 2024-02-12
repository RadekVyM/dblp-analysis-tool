import 'server-only'
import { anyKeys } from '@/utils/objects'
import changePasswordValidator from '@/validation/changePasswordValidator'
import { getCurrentUser } from '.'
import bcrypt from 'bcrypt'
import hashPassword from './hashPassword'
import connectDb from '@/db/mongodb'
import User, { UserSchema } from '@/db/models/User'
import { unauthorizedError } from '@/utils/errors'

/**
 * Tries to change the current user's password. 
 * @param currentPassword Current password of the user
 * @param newPassword New password of the user
 * @param confirmNewPassword Confirmation of the new password
 */
export default async function changePassword(
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
): Promise<void> {
    const error = changePasswordValidator({ currentPassword, newPassword, confirmNewPassword });

    if (anyKeys(error)) {
        throw unauthorizedError('The values you entered are not valid.');
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
        throw unauthorizedError('You need to be signed in to change your profile information.');
    }

    const passwordMatch = await bcrypt.compare(currentPassword, currentUser.passwordHash);

    if (!passwordMatch) {
        throw unauthorizedError('Invalid password has been entered.');
    }

    if (newPassword !== confirmNewPassword) {
        throw unauthorizedError('Passwords do not match.');
    }

    const passwordHash = await hashPassword(newPassword);

    await connectDb();

    const result = await User.findByIdAndUpdate<UserSchema>(currentUser._id, {
        passwordHash: passwordHash
    });
}