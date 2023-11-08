import { getSavedAuthors, saveAuthor } from '@/services/saves/authors'
import { NextResponse } from 'next/server'
import { authorDto, authorizedRequest } from '../../shared'

export async function GET(request: Request) {
    return await authorizedRequest(async (user) => {
        const authors = await getSavedAuthors(user);
        return NextResponse.json(authors)
    },
    'Saved authors could not be fetched.')
}

export async function POST(request: Request) {
    return await authorizedRequest(async (user) => {
        const dto = await authorDto(request);
        if (dto instanceof NextResponse) {
            return dto
        }

        const author = await saveAuthor(dto, user);
        return NextResponse.json(author)
    },
    'Author could not be saved.')
}