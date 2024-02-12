import { DblpAuthor } from '@/dtos/DblpAuthor'

/**
 * Fetches an author on the client.
 * @param authorId Author ID
 * @returns An object of a fetched author
 */
export default async function authorFetcher(authorId: string, signal?: AbortSignal) {
    const response = await fetch(`/api/author/${authorId}`, { signal: signal });
    return await response.json() as DblpAuthor;
}