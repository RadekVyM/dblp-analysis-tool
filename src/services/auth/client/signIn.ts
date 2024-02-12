import { unpackDefaultError } from '@/utils/errors'
import { signIn as nextSignIn } from 'next-auth/react'

/**
 * Signs a user in.
 * This function can be called only on the client beacause it uses the signIn() function from next-auth.
 * @param email User's email
 * @param password User's password
 * @param callbackUrl URL of a page where the user should be redirected after successfull sign in
 */
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