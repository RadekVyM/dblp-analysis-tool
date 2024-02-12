import { DblpAuthor } from '@/dtos/DblpAuthor'
import { useEffect, useMemo, useState } from 'react'

export default function useAuthors(alreadyAvailableAuthors: Array<DblpAuthor>, authorIds: Array<string>) {
    const [authors, setAuthors] = useState<Array<DblpAuthor>>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setAuthors([]);
        setIsLoading(true);
        const controller = new AbortController();
        const signal = controller.signal;

        fetchAuthors(
            authorIds,
            (authors) => setAuthors((oldAuthors) => [...oldAuthors, ...authors]),
            signal)
            .then()
            .finally(() => {
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [authorIds]);

    return {
        authors,
        isLoading
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
            const separator = stringBuffer.lastIndexOf('\n');

            if (separator !== -1) {
                const completeData = stringBuffer.substring(0, separator);
                const jsonObjects = completeData.split('\n');
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