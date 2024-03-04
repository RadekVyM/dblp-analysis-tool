import { fetchAuthor } from '@/services/authors/fetch-server'
import { NextResponse } from 'next/server'

/** Endpoint for loading an author information. */
export async function GET(request: Request, { params }: { params: { authorId: string } }) {
    try {
        const author = await fetchAuthor(params.authorId);
        return NextResponse.json(author);
    }
    catch (error) {
        return new NextResponse('Something went wrong while retrieving the author.', { status: 400 });
    }
}