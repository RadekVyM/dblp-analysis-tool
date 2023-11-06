import { SavedAuthor } from '@/dtos/SavedAuthors'
import getCurrentUser from '@/services/auth/getCurrentUser'
import { getSavedAuthors, saveAuthor } from '@/services/saves/authors'
import { NextResponse } from 'next/server'
import { noUser } from '../shared'

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        const authors = await getSavedAuthors(user);
        return NextResponse.json(authors)
    }
    catch (e) {
        return new NextResponse('Saved authors could not be fetched.', { status: 400 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return noUser()
        }

        const dto = await authorDto(request);
        if (dto instanceof NextResponse) {
            return dto
        }

        const author = await saveAuthor(dto, user);
        return NextResponse.json(author)
    }
    catch (error) {
        return new NextResponse('Author could not be saved.', { status: 400 })
    }
}

async function authorDto(request: Request) {
    const dto = await request.json() as SavedAuthor;

    if (!dto.id || !dto.title) {
        return new NextResponse('Some properties are missing.', { status: 400 })
    }

    return dto
}