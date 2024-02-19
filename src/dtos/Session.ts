/** Session object used for authentication. */
export type Session = {
    user: {
        username: string,
        email: string
    },
    expires: Date
}