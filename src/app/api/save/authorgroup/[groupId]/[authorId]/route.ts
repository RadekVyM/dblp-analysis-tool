import { NextResponse } from 'next/server'
import { noUser } from '../../../shared'
import getCurrentUser from '@/services/auth/getCurrentUser'
import { removeAuthorsFromAuthorGroup } from '@/services/saves/authorGroups'

export async function DELETE(request: Request, { params }: { params: { groupId: string, authorId: string } }) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        await removeAuthorsFromAuthorGroup([params.authorId], params.groupId, user);

        return new NextResponse(null, { status: 204 })
    }
    catch (error) {
        return new NextResponse('Author could not be removed from the group.', { status: 400 })
    }
}