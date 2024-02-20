import { NextResponse } from 'next/server'
import { authorDto, authorizedRequest } from '../../../shared'
import { removeAuthorGroup, addAuthorsToAuthorGroup } from '@/services/saves/authorGroups'

export async function POST(request: Request, { params }: { params: { groupId: string } }) {
    return await authorizedRequest(
        async (user) => {
            const dto = await authorDto(request);
            if (dto instanceof NextResponse) {
                return dto;
            }

            const authorGroup = await addAuthorsToAuthorGroup([dto], params.groupId, user);

            return NextResponse.json(authorGroup);
        },
        'Author could not be added to the group.');
}

export async function DELETE(request: Request, { params }: { params: { groupId: string } }) {
    return await authorizedRequest(
        async (user) => {
            await removeAuthorGroup(params.groupId, user);
            return new NextResponse(null, { status: 204 });
        },
        'Author group could not be removed.');
}