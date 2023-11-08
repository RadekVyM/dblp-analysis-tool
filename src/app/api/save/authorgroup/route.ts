import { AuthorGroup } from '@/dtos/SavedAuthors'
import getCurrentUser from '@/services/auth/getCurrentUser'
import { getAuthorGroups, createOrUpdateAuthorGroup } from '@/services/saves/authorGroups'
import { NextResponse } from 'next/server'
import { noUser } from '../shared'

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        const authorGroups = await getAuthorGroups(user);
        return NextResponse.json(authorGroups)
    }
    catch (e) {
        return new NextResponse('Author groups could not be fetched.', { status: 400 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        const dto = await authorGroupDto(request);
        if (dto instanceof NextResponse) {
            return dto
        }

        const authorGroup = await createOrUpdateAuthorGroup(dto, user);
        return NextResponse.json(authorGroup)
    }
    catch (error) {
        return new NextResponse('Author group could not be saved.', { status: 400 })
    }
}

async function authorGroupDto(request: Request) {
    const dto = await request.json() as AuthorGroup;

    // TODO: Validation using Zod?
    if (!dto.title) {
        return new NextResponse('Some properties are missing.', { status: 400 })
    }

    return dto
}