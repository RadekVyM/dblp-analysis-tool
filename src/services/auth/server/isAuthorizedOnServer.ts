import 'server-only'
import { getServerSession } from 'next-auth'

/** Finds out wheter there is a user authorized. Can be called only on the server. */
export default async function isAuthorizedOnServer() {
    const session = await getServerSession();
    return session && session.user;
}