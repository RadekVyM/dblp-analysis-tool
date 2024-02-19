'use client'

import PageTitle from '@/components/shell/PageTitle'
import useSession from '@/hooks/useSession';

export default function ProfileHeader() {
    const session = useSession();

    return (
        <header>
            <PageTitle
                title={session?.user?.username || ''}
                subtitle='Profile'
                className='pb-12' />
        </header>
    )
}