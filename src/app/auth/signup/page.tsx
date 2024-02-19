import { redirect } from 'next/navigation'
import SignUpForm from '../(components)/SignUpForm'
import PageContainer from '@/components/shell/PageContainer'
import Link from 'next/link'
import { getSession } from '@/services/auth/session'

export default async function SignUpPage({ }) {
    const session = await getSession();

    if (session) {
        redirect('/profile');
    }

    return (
        <PageContainer
            className='justify-center items-center py-6'>
            <div
                className='max-w-lg w-full'>
                <h2 className='font-extrabold text-3xl text-on-surface mb-6'>Sign Up</h2>

                <SignUpForm
                    className='w-full mb-8' />

                <span className='text-center mx-auto block'>Already have an account? <Link href='/auth/signin' className='underline' prefetch={false}>Sign in</Link></span>
            </div>
        </PageContainer>
    )
}