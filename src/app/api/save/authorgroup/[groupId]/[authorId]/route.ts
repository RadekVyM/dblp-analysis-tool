import { NextResponse } from 'next/server'
import { authorizedRequest } from '../../../../shared'
import { removeAuthorsFromAuthorGroup } from '@/services/saves/authorGroups'

export async function DELETE(request: Request, { params }: { params: { groupId: string, authorId: string } }) {
    return await authorizedRequest(async (user) => {
        await removeAuthorsFromAuthorGroup([params.authorId], params.groupId, user);
        return new NextResponse(null, { status: 204 })
    },
    'Author could not be removed from the group.')
}