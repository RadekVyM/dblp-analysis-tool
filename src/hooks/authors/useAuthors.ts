import { DblpAuthor } from '@/dtos/DblpAuthor'
import { useEffect, useState } from 'react'
import authorFetcher from './authorFetcher'
import { delay } from '@/utils/promises'

export default function useAuthors(alreadyAvailableAuthors: Array<DblpAuthor>, authorIds: Array<string>) {
    const [authors, setAuthors] = useState([...alreadyAvailableAuthors]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const authorIdsToDownload = authorIds.filter((id) => !alreadyAvailableAuthors.some((a) => a.id === id));
        const controller = new AbortController();
        const signal = controller.signal;

        fetchAuthorsSequentially(
            authorIdsToDownload,
            (author) => setAuthors((oldAuthors) => [...oldAuthors, author]),
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

async function fetchAuthorsSequentially(
    authorIds: Array<string>,
    onAuthorFetched: (author: DblpAuthor) => void,
    signal: AbortSignal
) {
    let lastFetchInitiationTime = new Date().getTime();

    for (const id of authorIds) {
        const author = await authorFetcher(id, signal);
        onAuthorFetched(author);

        const now = new Date().getTime();
        const difference = now - lastFetchInitiationTime;

        // I want every fetch to be at least 1.2 second long
        if (difference > 1200) {
            await delay(difference);
        }
    }
}