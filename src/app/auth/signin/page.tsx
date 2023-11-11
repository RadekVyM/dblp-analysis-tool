import SignInForm from '../(components)/SignInForm'
import PageContainer from '@/components/shell/PageContainer'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type SignInPageParams = {
    searchParams: { [key: string]: any }
}

export default async function SignInPage({ searchParams }: SignInPageParams) {
    const session = await getServerSession();

    if (session && session?.user) {
        redirect('/profile');
    }

    return (
        <PageContainer
            className='justify-center items-center py-6'>
            <div
                className='max-w-lg w-full'>
                <h2 className='font-extrabold text-3xl text-on-surface mb-6'>Sign In</h2>

                <SignInForm
                    className='w-full mb-8' />

                <span className='text-center mx-auto block'>Don&apos;t have an account? <Link href='/auth/signup' className='underline' prefetch={false}>Sign up</Link></span>
            </div>
        </PageContainer>
    )
}