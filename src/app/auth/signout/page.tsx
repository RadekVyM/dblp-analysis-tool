'use client'

import Button from '@/components/Button'
import PageContainer from '@/components/shell/PageContainer'
import { signOut } from 'next-auth/react'

export default function SignOutPage() {
    return (
        <PageContainer
            className='justify-center items-center py-6'>
            <div
                className='max-w-lg w-full'>
                <h2 className='font-extrabold text-3xl text-on-surface mb-6'>Sign Out</h2>

                <span className='block mb-6'>Are you sure you want to sign out?</span>

                <Button
                    onClick={async () => await signOut()}>
                    Sign Out
                </Button>
            </div>
        </PageContainer>
    )
}