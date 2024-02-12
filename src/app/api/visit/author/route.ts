import { NextResponse } from 'next/server'
import { authorDto, authorizedRequest } from '../../shared'
import { getVisitedAuthors, updateVisitedAuthor } from '@/services/visits/authors'
import { DISPLAYED_VISITED_AUTHORS_COUNT } from '@/constants/visits'

export async function GET(request: Request) {
    return await authorizedRequest(async (user) => {
        const authors = await getVisitedAuthors(user, DISPLAYED_VISITED_AUTHORS_COUNT);
        return NextResponse.json(authors)
    },
    'Visited authors could not be fetched.')
}

export async function POST(request: Request) {
    return await authorizedRequest(async (user) => {
        const dto = await authorDto(request);
        if (dto instanceof NextResponse) {
            return dto
        }

        const author = await updateVisitedAuthor(dto, user);
        return NextResponse.json(author)
    },
    'Visited author could not be saved.')
}