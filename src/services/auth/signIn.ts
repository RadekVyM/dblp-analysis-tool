import { unpackDefaultError } from '@/utils/errors'
import { signIn as nextSignIn } from 'next-auth/react'

export default async function signIn(email: string, password: string, callbackUrl: string) {
    const response = await nextSignIn('credentials', {
        redirect: false,
        email: email,
        password: password,
        callbackUrl
    });

    if (response?.error) {
        const errorObject = unpackDefaultError(response.error);
        throw new Error(errorObject ? errorObject.message : response.error);
    }
}