import 'server-only'
import User, { UserSchema } from '@/db/models/User'
import connectDb from '@/db/mongodb'
import { getServerSession } from 'next-auth'

/**
 * Returns the signed in user.
 * @returns Current user database object or null if no user is found
 */
export default async function getCurrentUser() {
    const session = await getServerSession();

    if (!session?.user?.email) {
        return null;
    }

    await connectDb();

    const user = await User.findOne<UserSchema>({ email: session?.user?.email });

    if (!user) {
        return null;
    }

    return user;
}