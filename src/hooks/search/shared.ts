'use client'

import { BaseSearchHit, createSearchResultFromRaw } from '@/dtos/search/SearchResult'
import { SearchType } from '@/enums/SearchType'
import { fetchAuthors } from '@/services/authors/fetch'
import { fetchVenues } from '@/services/venues/fetch'
import { SearchItemsParams } from '@/dtos/search/SearchItemsParams'
import { RawBaseSearchResult } from '@/dtos/search/RawSearchResult'

// https://swr.vercel.app/docs/api#options
export const SWR_CONFIG = { revalidateIfStale: false, revalidateOnFocus: false };

export type SearchItemsArgs = { searchType: SearchType, params: SearchItemsParams }

/**
 * Creates arguments for the useSWR() function that performs search.
 * @param searchType Type of search
 * @param query Query string
 * @param hitsCount Max number of items that can be returned
 * @param completionsCount Max number of items that can be returned
 * @returns Arguments for the useSWR() function
 */
export function createArgs(searchType: SearchType, query: string, hitsCount: number, completionsCount: number): SearchItemsArgs {
    const params: SearchItemsParams = {
        query: query.length > 0 ? query : undefined,
        first: 0,
        count: hitsCount,
        completionsCount: completionsCount
    };

    return { searchType: searchType, params: params };
}

/**
 * Returns a function that performs search.
 * @param searchType Type of search
 * @returns Function that performs search
 */
export function createSearchFetcher<HitT extends BaseSearchHit>(searchType: SearchType) {
    let fetchItems: (params: SearchItemsParams) => Promise<any>;

    switch (searchType) {
        case SearchType.Author:
            fetchItems = fetchAuthors;
            break;
        case SearchType.Venue:
            fetchItems = fetchVenues;
            break;
    }

    return (args: SearchItemsArgs) => {
        if (!args.params.query || (args.params.count === 0 && args.params.completionsCount === 0)) {
            return null;
        }

        // TODO: Handle error codes
        return fetchItems(args.params)
            .then(data => createSearchResultFromRaw<HitT>(data as RawBaseSearchResult, args.searchType));
    };
}