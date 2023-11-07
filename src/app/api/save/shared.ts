import { SavedAuthor } from '@/dtos/SavedAuthors'
import { NextResponse } from 'next/server'

export async function noUser() {
    return new NextResponse('No user found.', { status: 401 })
}

export async function authorDto(request: Request) {
    const dto = await request.json() as SavedAuthor;

    // TODO: Validation using Zod?
    if (!dto.id || !dto.title) {
        return new NextResponse('Some properties are missing.', { status: 400 })
    }

    return dto
}