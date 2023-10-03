'use client'

import useSWR, { Fetcher } from 'swr'
import { DblpAuthorSearchHit, DblpSearchResult } from '@/models/DblpSearchResult'
import { SearchType } from '@/enums/SearchType'
import { SWR_CONFIG, SearchItemsArgs, createArgs, createSearchFetcher } from './shared'

const authorsSearchFetcher: Fetcher<DblpSearchResult<DblpAuthorSearchHit> | null, SearchItemsArgs> = createSearchFetcher<DblpAuthorSearchHit>(SearchType.Author);

export function useAuthorsSearch(query: string, hitsCount: number = 5, completionsCount: number = 5) {
    const { data, error, isLoading } = useSWR(createArgs(SearchType.Author, query, hitsCount, completionsCount), authorsSearchFetcher, SWR_CONFIG);

    return {
        authors: data,
        isLoading,
        error: error
    }
}