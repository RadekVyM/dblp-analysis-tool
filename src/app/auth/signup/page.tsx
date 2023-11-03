import { signUp } from '@/services/auth/signUp'
import { isNullOrWhiteSpace } from '@/utils/strings'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import SignUpForm from '../(components)/SignUpForm'
import PageContainer from '@/components/PageContainer'
import Link from 'next/link'

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
        <PageContainer
            className='justify-center items-center py-6'>
            <div
                className='max-w-lg w-full'>
                <h2 className='font-extrabold text-3xl text-on-surface mb-6'>Sign up</h2>

                <SignUpForm
                    className='w-full mb-8'
                    submit={submit} />

                <span className='text-center mx-auto block'>Already have an account? <Link href='/auth/signin' className='underline'>Sign in</Link></span>
            </div>
        </PageContainer>
    )
}