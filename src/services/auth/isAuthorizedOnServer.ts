import { getServerSession } from 'next-auth'

export default async function isAuthorizedOnServer() {
    const session = await getServerSession();
    return session && session.user
}