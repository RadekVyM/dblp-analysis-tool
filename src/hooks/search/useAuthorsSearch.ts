'use client'

import useSWR, { Fetcher } from 'swr'
import { DblpAuthorSearchHit, DblpSearchResult } from '@/dtos/DblpSearchResult'
import { SearchType } from '@/enums/SearchType'
import { SWR_CONFIG, SearchItemsArgs, createArgs, createSearchFetcher } from './shared'

const authorsSearchFetcher: Fetcher<DblpSearchResult<DblpAuthorSearchHit> | null, SearchItemsArgs> = createSearchFetcher<DblpAuthorSearchHit>(SearchType.Author);

/**
 * Hook that performs an authors search based on a query string.
 * @param query Query string
 * @param hitsCount Max number of items that can be returned
 * @param completionsCount Max number of completions that can be returned
 * @returns Fetched data and state variables
 */
export function useAuthorsSearch(query: string, hitsCount: number = 5, completionsCount: number = 5) {
    const { data, error, isLoading } = useSWR(createArgs(SearchType.Author, query, hitsCount, completionsCount), authorsSearchFetcher, SWR_CONFIG);

    return {
        authors: data,
        isLoading,
        error: error
    }
}