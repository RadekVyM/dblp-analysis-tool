import { STREAMED_OBJECTS_SEPARATOR } from '@/constants/streams'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { fetchAuthor } from '@/services/authors/fetch-server'
import { tryGetCachedAuthor } from '@/services/cache/authors'
import { delay } from '@/utils/promises'
import { iteratorToStream } from '@/utils/readableStreams'
import { NextRequest, NextResponse } from 'next/server'

// See for more info:
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming
// https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams

export async function GET(request: NextRequest, { searchParams }: { searchParams: { authorIds: string } }) {
    const authorIds = request.nextUrl.searchParams.get('authorIds');

    if (!authorIds) {
        return new NextResponse('Something went wrong while retrieving the authors.', { status: 400 });
    }

    const authorsIdsParsed = JSON.parse(authorIds);

    if (!Array.isArray(authorsIdsParsed)) {
        return new NextResponse('Something went wrong while retrieving the authors.', { status: 400 });
    }

    const authorsIdsArray = authorsIdsParsed as Array<string>;

    const iterator = fetchAuthors(authorsIdsArray);
    const stream = iteratorToStream(iterator);

    return new Response(stream);
}

async function* fetchAuthors(authorIds: Array<string>) {
    let hasAlreadyFetched = false;

    for (const id of authorIds) {
        const cachedAuthor = await tryGetCachedAuthor(id);

        if (cachedAuthor) {
            yield authorToJson(cachedAuthor);
        }
        else {
            if (hasAlreadyFetched) {
                await delay(1200);
            }
            const author = await fetchAuthor(id);
            hasAlreadyFetched = true;
            yield authorToJson(author);
        }
    }
}

function authorToJson(author: DblpAuthor) {
    return `${JSON.stringify(author, null, 0)}${STREAMED_OBJECTS_SEPARATOR}`;
}