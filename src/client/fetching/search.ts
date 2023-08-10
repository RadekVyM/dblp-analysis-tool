'use client'

import { DblpAuthorSearchHit, BaseDblpSearchHit, DblpSearchResult, RawDblpBaseSearchResult, DblpVenueSearchHit } from '@/shared/dtos/DblpSearchResult'
import { SearchType } from '@/shared/enums/SearchType';
import { queryAuthors } from '@/shared/fetching/authors';
import { ItemsParams } from '@/shared/fetching/fetching';
import { queryVenues } from '@/shared/fetching/venues';
import useSWR, { Fetcher } from 'swr'

type SearchItemsArgs = { searchType: SearchType, params: ItemsParams }

const authorsSearchFetcher: Fetcher<DblpSearchResult<DblpAuthorSearchHit> | null, SearchItemsArgs> = createSearchFetcher<DblpAuthorSearchHit>(SearchType.Author);
const venuesSearchFetcher: Fetcher<DblpSearchResult<DblpVenueSearchHit> | null, SearchItemsArgs> = createSearchFetcher<DblpVenueSearchHit>(SearchType.Venue);

export function useAuthorsSearch(query: string, hitsCount: number = 5, completionsCount: number = 5) {
    const { data, error, isLoading } = useSWR(createArgs(SearchType.Author, query, hitsCount, completionsCount), authorsSearchFetcher);

    return {
        authors: data,
        isLoading,
        isError: error
    }
}

export function useVenuesSearch(query: string, hitsCount: number = 5, completionsCount: number = 5) {
    const { data, error, isLoading } = useSWR(createArgs(SearchType.Venue, query, hitsCount, completionsCount), venuesSearchFetcher);

    return {
        venues: data,
        isLoading,
        isError: error
    }
}

function createArgs(searchType: SearchType, query: string, hitsCount: number, completionsCount: number): SearchItemsArgs {
    const params: ItemsParams = {
        query: query.length > 0 ? query : undefined,
        first: 0,
        count: hitsCount,
        completionsCount: completionsCount
    };

    return { searchType: searchType, params: params };
}

function createSearchFetcher<HitT extends BaseDblpSearchHit>(searchType: SearchType) {
    let fetchItems: (params: ItemsParams) => Promise<any>;

    switch (searchType) {
        case SearchType.Author:
            fetchItems = queryAuthors;
            break;
        case SearchType.Venue:
            fetchItems = queryVenues;
            break;
    }

    return (args: SearchItemsArgs) => {
        if (!args.params.query || args.params.count == 0 || args.params.completionsCount == 0) {
            return null;
        }

        // TODO: Handle error codes
        return fetchItems(args.params)
            .then(data => new DblpSearchResult<HitT>(data as RawDblpBaseSearchResult, args.searchType));
    }
}
