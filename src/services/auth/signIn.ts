import { signIn as nextSignIn } from 'next-auth/react'

export default async function signIn(email: string, password: string, callbackUrl: string) {
    // TODO: server-side validation

    const response = await nextSignIn('credentials', {
        redirect: false,
        email: email,
        password: password,
        callbackUrl
    });

    if (response?.error) {
        throw new Error(response.error);
    }
}