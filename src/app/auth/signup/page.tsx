import { signUp } from '@/services/auth/signUp'
import { isNullOrWhiteSpace } from '@/utils/strings'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import SignUpForm from '../(components)/SignUpForm'
import PageContainer from '@/components/PageContainer'
import Link from 'next/link'
import { getServerSession } from 'next-auth'

export default async function SignUpPage({ }) {
    const session = await getServerSession();

    if (session && session?.user) {
        redirect('/auth/profile');
    }

    async function submit(prevState: any, formData: FormData) {
        'use server'

        const email = formData.get('email')?.toString() || '';
        const username = formData.get('username')?.toString() || '';
        const password = formData.get('password')?.toString() || '';
        const confirmPassword = formData.get('confirmPassword')?.toString() || '';

        if (isNullOrWhiteSpace(email) || isNullOrWhiteSpace(username) || isNullOrWhiteSpace(password) || isNullOrWhiteSpace(confirmPassword)) {
            revalidatePath('auth');
            return
        }

        try {
            await signUp(email, username, password, confirmPassword);
        }
        catch (e) {
            if (e instanceof Error) {
                return { error: e.message }
            }
        }

        redirect('/auth/signin');
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

                <span className='text-center mx-auto block'>Already have an account? <Link href='/auth/signin' className='underline' prefetch={false}>Sign in</Link></span>
            </div>
        </PageContainer>
    )
}