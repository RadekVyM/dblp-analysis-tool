import useSWR from 'swr'
import authorFetcher from './authorFetcher'

/**
 * Hook that fetches an author with a specified ID.
 * @param authorId Author ID
 * @returns Fetched data and state variables
 */
export default function useAuthor(authorId: string) {
    const { data, error, isLoading } = useSWR(authorId, authorFetcher);

    return {
        author: data,
        isLoading,
        error: error
    }
}