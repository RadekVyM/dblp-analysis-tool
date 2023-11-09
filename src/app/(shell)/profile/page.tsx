import Button from '@/components/Button'
import Input from '@/components/forms/Input'
import PageContainer from '@/components/PageContainer'
import PageTitle from '@/components/PageTitle'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import YourInfoForm from './(components)/YourInfoForm'
import { isNullOrWhiteSpace } from '@/utils/strings'
import { revalidatePath } from 'next/cache'
import { changeUserInfo } from '@/services/auth/changeUserInfo'
import ProfileHeader from './(components)/ProfileHeader'

type YourInfoParams = {
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
            <ProfileHeader />

            <YourInfo />

            <ChangePassword />

            <DeleteAccount />
        </PageContainer>
    )
}

function YourInfo({ }: YourInfoParams) {
    async function submit(prevState: any, formData: FormData) {
        'use server'

        const email = formData.get('email')?.toString() || '';
        const username = formData.get('username')?.toString() || '';

        if (isNullOrWhiteSpace(email) || isNullOrWhiteSpace(username)) {
            revalidatePath('profile');
            return
        }

        try {
            const user = await changeUserInfo(email, username);
            // Send the updated data back to the client to update the current session
            return { email: user?.email, username: user?.username }
        }
        catch (e) {
            if (e instanceof Error) {
                return { error: e.message }
            }
        }

        revalidatePath('profile');
    }

    return (
        <Section
            title='Your Info'>
            <YourInfoForm
                submit={submit} />
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