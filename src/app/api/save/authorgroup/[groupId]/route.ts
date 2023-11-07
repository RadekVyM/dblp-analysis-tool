import { NextResponse } from 'next/server'
import { authorDto, noUser } from '../../shared'
import getCurrentUser from '@/services/auth/getCurrentUser'
import { removeAuthorGroup, addAuthorsToAuthorGroup } from '@/services/saves/authorGroups'

export async function POST(request: Request, { params }: { params: { groupId: string } }) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        const dto = await authorDto(request);
        if (dto instanceof NextResponse) {
            return dto
        }

        await addAuthorsToAuthorGroup([dto], params.groupId, user);

        return new NextResponse(null, { status: 204 })
    }
    catch (error) {
        return new NextResponse('Author group could not be removed.', { status: 400 })
    }
}

export async function DELETE(request: Request, { params }: { params: { groupId: string } }) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        await removeAuthorGroup(params.groupId, user);

        return new NextResponse(null, { status: 204 })
    }
    catch (error) {
        return new NextResponse('Author group could not be removed.', { status: 400 })
    }
}