import PageContainer from '@/components/PageContainer';
import PageTitle from '@/components/PageTitle';
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const session = await getServerSession();

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    return (
        <PageContainer>
            <header>
                <PageTitle
                    title={session?.user?.name || ''}
                    subtitle='Profile'
                    className='pb-3' />
            </header>
        </PageContainer>
    )
}