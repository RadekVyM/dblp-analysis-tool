import PageContainer from '@/components/shell/PageContainer'
import { redirect } from 'next/navigation'
import YourInfoForm from './(components)/YourInfoForm'
import ProfileHeader from './(components)/ProfileHeader'
import ChangePasswordForm from './(components)/ChangePasswordForm'
import DeleteAccountForm from './(components)/DeleteAccountForm'
import { getSession } from '@/services/auth/session'

type YourInfoParams = {
}

type SectionParams = {
    title: React.ReactNode,
    children: React.ReactNode,
}

export default async function ProfilePage() {
    const session = await getSession();

    if (!session) {
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
    return (
        <Section
            title='Your Info'>
            <YourInfoForm />
        </Section>
    )
}

function ChangePassword() {
    return (
        <Section
            title='Change Password'>
            <ChangePasswordForm />
        </Section>
    )
}

function DeleteAccount() {
    return (
        <Section
            title='Delete Account'>
            <DeleteAccountForm />
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