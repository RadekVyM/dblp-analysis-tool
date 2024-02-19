import 'server-only'
import { destroySession } from './session'

/**
 * Signs the current user out.
 */
export default function signOut() {
    destroySession();
}