import 'server-only'
import { getSession } from './session'

/** Finds out wheter there is a user authorized. Can be called only on the server. */
export default async function isAuthorizedOnServer() {
    const session = await getSession();
    return session && session.user;
}