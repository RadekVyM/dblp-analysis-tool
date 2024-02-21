import useSWRImmutable from 'swr/immutable'
import { DblpAuthor } from '@/dtos/DblpAuthor'

/**
 * Hook that fetches an author with a specified ID.
 * @param authorId Author ID
 * @returns Fetched data and state variables
 */
export default function useAuthor(authorId: string) {
    const { data, error, isLoading } = useSWRImmutable(authorId, authorFetcher);

    return {
        author: data,
        isLoading,
        error: error
    };
}

/**
 * Fetches an author on the client.
 * @param authorId Author ID
 * @returns An object of a fetched author
 */
async function authorFetcher(authorId: string, signal?: AbortSignal) {
    const response = await fetch(`/api/author/${authorId}`, { signal: signal });
    return await response.json() as DblpAuthor;
}