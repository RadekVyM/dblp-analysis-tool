'use client'

import SignInForm from '../(components)/SignInForm'
import PageContainer from '@/components/PageContainer'
import Link from 'next/link'

type SignInPageParams = {
    searchParams: { [key: string]: any }
}

export default async function SignInPage({ searchParams }: SignInPageParams) {

    return (
        <PageContainer
            className='justify-center items-center py-6'>
            <div
                className='max-w-lg w-full'>
                <h2 className='font-extrabold text-3xl text-on-surface mb-6'>Sign in</h2>
                <p>{searchParams?.error}</p>

                <SignInForm
                    className='w-full mb-8' />

                <span className='text-center mx-auto block'>Don't have an account? <Link href='/auth/signup' className='underline'>Sign up</Link></span>
            </div>
        </PageContainer>
    )
}