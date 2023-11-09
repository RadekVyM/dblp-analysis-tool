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