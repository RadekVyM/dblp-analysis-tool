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
import ChangePasswordForm from './(components)/ChangePasswordForm'
import changePassword from '@/services/auth/changePassword'
import DeleteAccountForm from './(components)/DeleteAccountForm'

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
            const handled = handleError(e)
            if (handled) {
                return handled
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
    async function submit(prevState: any, formData: FormData) {
        'use server'

        const currentPassword = formData.get('currentPassword')?.toString() || '';
        const newPassword = formData.get('newPassword')?.toString() || '';
        const confirmNewPassword = formData.get('confirmNewPassword')?.toString() || '';

        if (isNullOrWhiteSpace(currentPassword) || isNullOrWhiteSpace(newPassword) || isNullOrWhiteSpace(confirmNewPassword)) {
            revalidatePath('profile');
            return
        }

        try {
            await changePassword(currentPassword, newPassword, confirmNewPassword);
        }
        catch (e) {
            const handled = handleError(e)
            if (handled) {
                return handled
            }
        }

        revalidatePath('profile');
    }

    return (
        <Section
            title='Change Password'>
            <ChangePasswordForm
                submit={submit} />
        </Section>
    )
}

function DeleteAccount() {
    async function submit(prevState: any, formData: FormData) {
        'use server'

        try {
        }
        catch (e) {
            const handled = handleError(e)
            if (handled) {
                return handled
            }
        }

        revalidatePath('profile');
    }

    return (
        <Section
            title='Delete Account'>
            <DeleteAccountForm
                submit={submit} />
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

function handleError(e: any) {
    if (e instanceof Error) {
        if (e instanceof TypeError) {
            return { error: 'Operation could not be finished.' }
        }

        return { error: e.message }
    }
}