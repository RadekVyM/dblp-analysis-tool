'use client'

import PageTitle from '@/components/PageTitle'
import { useSession } from 'next-auth/react'

export default function ProfileHeader() {
    const session = useSession();

    return (
        <header>
            <PageTitle
                title={session.data?.user?.name || ''}
                subtitle='Profile'
                className='pb-12' />
        </header>
    )
}