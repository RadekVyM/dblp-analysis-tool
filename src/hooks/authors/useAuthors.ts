import { STREAMED_OBJECTS_SEPARATOR } from '@/constants/fetch'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { useMemo } from 'react'
import useSWRSubscription, { SWRSubscriptionOptions } from 'swr/subscription'

/**
 * Hook that downloads information about all specified authors. 
 * @param alreadyAvailableAuthors Already available authors that were pulled from the cache 
 * @param authorIds IDs of required authors
 * @returns List of authors and state of loading
 */
export default function useAuthors(alreadyAvailableAuthors: Array<DblpAuthor>, authorIds: Array<string>) {
    const authorIdsToFetch = useMemo(
        () => authorIds.filter((id) => !alreadyAvailableAuthors.some((a) => a.id === id)),
        [alreadyAvailableAuthors, authorIds]);
    const { data, error } = useSWRSubscription(authorIdsToFetch, (key, { next }: SWRSubscriptionOptions<Array<DblpAuthor>, Error>) => {
        const controller = new AbortController();
        const signal = controller.signal;

        fetchAuthors(
            authorIdsToFetch,
            (authors) => next(null, prev => (prev || []).concat(authors)),
            signal)
            .then()
            .catch((error) => {
                if (!(error instanceof DOMException) || error.name !== 'AbortError') {
                    next(error);
                }
            });

        return () => controller.abort();
    });
    const authors = useMemo(() => [...alreadyAvailableAuthors, ...(data || [])], [alreadyAvailableAuthors, data]);

    return {
        authors,
        error
    }
}

async function fetchAuthors(
    authorIds: Array<string>,
    onAuthorFetched: (authors: Array<DblpAuthor>) => void,
    signal: AbortSignal
) {
    const response = await fetch(`/api/authors?authorIds=${JSON.stringify(authorIds)}`, { signal: signal });

    if (!response.body) {
        return;
    }

    const reader = response.body.getReader();

    // One chunk can contain just a part of an object
    // So I pile up the content to a buffer
    let stringBuffer = '';
    let isDone = true;

    do {
        const readerResult = await reader.read();
        isDone = readerResult.done;

        if (!isDone && readerResult.value) {
            const newChunk = Buffer.from(readerResult.value).toString('utf8');
            stringBuffer += newChunk;
            const separator = stringBuffer.lastIndexOf(STREAMED_OBJECTS_SEPARATOR);

            if (separator !== -1) {
                // Buffer contains separator => buffer contains whole object
                const completeData = stringBuffer.substring(0, separator);
                const jsonObjects = completeData.split(STREAMED_OBJECTS_SEPARATOR);
                stringBuffer = stringBuffer.substring(separator + 1);
                const authors: Array<DblpAuthor> = [];

                for (const jsonObject of jsonObjects) {
                    if (!jsonObject) {
                        continue;
                    }

                    const author = JSON.parse(jsonObject) as DblpAuthor;
                    authors.push(author);
                }

                onAuthorFetched(authors);
            }
        }
    }
    while (!isDone);
}