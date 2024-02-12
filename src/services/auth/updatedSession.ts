/**
 * Returns updated session.
 * @param oldSession Old session
 * @param username New username
 * @param email New email
 * @returns Updated session
 */
export default function updatedSession(oldSession: any, username?: string, email?: string) {
    return {
        ...oldSession,
        user: {
            ...oldSession?.user,
            email: email,
            name: username
        }
    }
}