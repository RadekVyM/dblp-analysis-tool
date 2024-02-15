import { STREAMED_OBJECTS_SEPARATOR } from '@/constants/streams'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { useEffect, useMemo, useState } from 'react'

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
    const [fetchedAuthors, setFetchedAuthors] = useState<Array<DblpAuthor>>([]);
    const authors = useMemo(() => [...alreadyAvailableAuthors, ...fetchedAuthors], [alreadyAvailableAuthors, fetchedAuthors]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (authorIdsToFetch.length === 0) {
            setError(null);
            setFetchedAuthors([]);
            setIsLoading(false);
            return;
        }

        setError(null);
        setFetchedAuthors([]);
        setIsLoading(true);
        const controller = new AbortController();
        const signal = controller.signal;

        fetchAuthors(
            authorIdsToFetch,
            (authors) => setFetchedAuthors((oldAuthors) => [...oldAuthors, ...authors]),
            signal)
            .then()
            .catch((error) => {
                if (!(error instanceof DOMException) || error.name !== 'AbortError') {
                    setError(error);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [authorIdsToFetch]);

    return {
        authors,
        isLoading,
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

    // One chunk can contain just a part of a object
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