import Button from '@/components/Button'
import Input from '@/components/Input'
import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

type YourInfoParams = {
    user: {
        name?: string | null,
        email?: string | null
    }
}

type SectionParams = {
    title: React.ReactNode,
    children: React.ReactNode,
}

export default async function ProfilePage() {
    const session = await getServerSession();

    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    return (
        <PageContainer>
            <header>
                <PageTitle
                    title={session.user.name || ''}
                    subtitle='Profile'
                    className='pb-12' />
            </header>

            <YourInfo
                user={session.user} />

            <ChangePassword />

            <DeleteAccount />
        </PageContainer>
    )
}

function YourInfo({ user }: YourInfoParams) {
    return (
        <Section
            title='Your Info'>
            <form
                className='flex flex-col gap-2 items-stretch max-w-xl'>
                <Input
                    id='profile-name'
                    label='Name'
                    defaultValue={user.name || ''} />
                <Input
                    id='profile-email'
                    label='E-mail'
                    type='email'
                    defaultValue={user.email || ''} />
                <Button
                    className='self-end mt-4'>
                    Save changes
                </Button>
            </form>
        </Section>
    )
}

function ChangePassword() {
    return (
        <Section
            title='Change Password'>
            <form
                className='flex flex-col gap-2 items-stretch max-w-xl'>
                <Input
                    id='profile-old-password'
                    label='Current password' />
                <Input
                    id='profile-new-password'
                    label='New password' />
                <Input
                    id='profile-confirm-new-password'
                    label='Confirm new password' />
                <Button
                    className='self-end mt-4'>
                    Change password
                </Button>
            </form>
        </Section>
    )
}

function DeleteAccount() {
    return (
        <Section
            title='Delete Account'>
            <Button
                variant='destructive'>
                Delete account
            </Button>
        </Section>
    )
}

function Section({ title, children }: SectionParams) {
    return (
        <section
            className='mb-10'>
            <h3 className='font-semibold mb-6 text-on-surface text-xl'>{title}</h3>
            {children}
        </section>
    )
}