'use client'

import useSWR, { Fetcher } from 'swr'
import { DblpSearchResult, DblpVenueSearchHit } from '@/models/DblpSearchResult'
import { SearchType } from '@/enums/SearchType'
import { SWR_CONFIG, SearchItemsArgs, createArgs, createSearchFetcher } from '@/hooks/search/shared'

const venuesSearchFetcher: Fetcher<DblpSearchResult<DblpVenueSearchHit> | null, SearchItemsArgs> = createSearchFetcher<DblpVenueSearchHit>(SearchType.Venue);

export function useVenuesSearch(query: string, hitsCount: number = 5, completionsCount: number = 5) {
    const { data, error, isLoading } = useSWR(createArgs(SearchType.Venue, query, hitsCount, completionsCount), venuesSearchFetcher, SWR_CONFIG);

    return {
        venues: data,
        isLoading,
        error: error
    }
}
