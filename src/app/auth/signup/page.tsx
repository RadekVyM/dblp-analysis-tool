import { signUp } from '@/services/auth/signUp'
import { isNullOrWhiteSpace } from '@/utils/strings'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import SignUpForm from '../(components)/SignUpForm'

export default async function SignUpPage({ }) {

    async function submit(prevState: any, formData: FormData) {
        'use server'

        const email = formData.get('email')?.toString() || '';
        const username = formData.get('username')?.toString() || '';
        const password = formData.get('password')?.toString() || '';

        if (isNullOrWhiteSpace(email) || isNullOrWhiteSpace(username) || isNullOrWhiteSpace(password)) {
            revalidatePath('auth');
            return
        }

        try {
            await signUp(email, username, password);
        }
        catch (e) {
            const error = e as Error
            console.log(error)
            return { error: error.message }
        }

        redirect('/');
    }

    return (
        <SignUpForm
            submit={submit} />
    )
}