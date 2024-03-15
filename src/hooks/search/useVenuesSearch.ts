'use client'

import useSWR, { Fetcher } from 'swr'
import { SearchResult, VenueSearchHit } from '@/dtos/search/SearchResult'
import { SearchType } from '@/enums/SearchType'
import { SWR_CONFIG, SearchItemsArgs, createArgs, createSearchFetcher } from '@/hooks/search/shared'

const venuesSearchFetcher: Fetcher<SearchResult<VenueSearchHit> | null, SearchItemsArgs> = createSearchFetcher<VenueSearchHit>(SearchType.Venue);

/**
 * Hook that performs a venue search based on a query string.
 * @param query Query string
 * @param hitsCount Max number of items that can be returned
 * @param completionsCount Max number of completions that can be returned
 * @returns Fetched data and state variables
 */
export function useVenuesSearch(query: string, hitsCount: number = 5, completionsCount: number = 5) {
    const { data, error, isLoading } = useSWR(createArgs(SearchType.Venue, query, hitsCount, completionsCount), venuesSearchFetcher, SWR_CONFIG);

    return {
        venues: data,
        isLoading,
        error: error
    };
}
