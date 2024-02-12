'use client'

import { BaseDblpSearchHit, DblpSearchResult, RawDblpBaseSearchResult } from '@/dtos/DblpSearchResult'
import { SearchType } from '@/enums/SearchType'
import { fetchAuthors } from '@/services/authors/fetch'
import { fetchVenues } from '@/services/venues/fetch'
import { SearchItemsParams } from '@/dtos/searchItemsParams'

// https://swr.vercel.app/docs/api#options
export const SWR_CONFIG = { revalidateIfStale: false, revalidateOnFocus: false };

export type SearchItemsArgs = { searchType: SearchType, params: SearchItemsParams }

export function createArgs(searchType: SearchType, query: string, hitsCount: number, completionsCount: number): SearchItemsArgs {
    const params: SearchItemsParams = {
        query: query.length > 0 ? query : undefined,
        first: 0,
        count: hitsCount,
        completionsCount: completionsCount
    };

    return { searchType: searchType, params: params };
}

export function createSearchFetcher<HitT extends BaseDblpSearchHit>(searchType: SearchType) {
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
            .then(data => new DblpSearchResult<HitT>(data as RawDblpBaseSearchResult, args.searchType));
    }
}