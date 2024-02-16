import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import { getAuthorGroups, saveAuthorGroup } from '@/services/saves/authorGroups'
import { NextResponse } from 'next/server'
import { authorizedRequest, noUser } from '../../shared'

export async function GET(request: Request) {
    return await authorizedRequest(async (user) => {
        const authorGroups = await getAuthorGroups(user);
        return NextResponse.json(authorGroups)
    },
        'Author groups could not be fetched.')
}

export async function POST(request: Request) {
    return await authorizedRequest(async (user) => {
        const dto = await authorGroupDto(request);
        if (dto instanceof NextResponse) {
            return dto
        }

        const authorGroup = await saveAuthorGroup(dto, user);
        return NextResponse.json(authorGroup)
    },
        'Author group could not be saved.')
}

async function authorGroupDto(request: Request) {
    const dto = await request.json() as AuthorGroup;

    // TODO: Validation using Zod?
    if (!dto.title) {
        return new NextResponse('Some properties are missing.', { status: 400 })
    }

    return dto
}