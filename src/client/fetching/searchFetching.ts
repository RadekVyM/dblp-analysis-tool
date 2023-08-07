'use client'

import { DblpAuthorSearchHit, BaseDblpSearchHit, DblpSearchResult, RawDblpBaseSearchResult, DblpVenueSearchHit } from '@/shared/dtos/DblpSearchResult'
import { SearchType } from '@/shared/enums/SearchType';
import useSWR, { Fetcher } from 'swr'

const DBLP_URL = 'https://dblp.org';
const DBLP_SEARCH_AUTHOR_API = '/search/author/api';
const DBLP_SEARCH_VENUE_API = '/search/venue/api';

function createSearchFetcher<HitT extends BaseDblpSearchHit>(type: SearchType) {
    return (input: string) => {
        if (!input.includes('q=') || (input.includes('h=0') && input.includes('c=0')))
            return null;

        // TODO: Handler error codes
        return fetch(input).then(res =>
            res.json().then(data => new DblpSearchResult<HitT>(data as RawDblpBaseSearchResult, type)))
    };
}

const authorsSearchFetcher: Fetcher<DblpSearchResult<DblpAuthorSearchHit> | null, string> = createSearchFetcher<DblpAuthorSearchHit>(SearchType.Author);
const venuesSearchFetcher: Fetcher<DblpSearchResult<DblpVenueSearchHit> | null, string> = createSearchFetcher<DblpVenueSearchHit>(SearchType.Venue);

export function useAuthorsSearch(query: string, hitsCount: number = 5, completionsCount: number = 5) {
    const queryString = createSearchQueryString(DBLP_SEARCH_AUTHOR_API, query, hitsCount, completionsCount);
    const { data, error, isLoading } = useSWR(queryString, authorsSearchFetcher);

    return {
        authors: data,
        isLoading,
        isError: error
    }
}

export function useVenuesSearch(query: string, hitsCount: number = 5, completionsCount: number = 5) {
    const queryString = createSearchQueryString(DBLP_SEARCH_VENUE_API, query, hitsCount, completionsCount);
    const { data, error, isLoading } = useSWR(queryString, venuesSearchFetcher);

    return {
        venues: data,
        isLoading,
        isError: error
    }
}

function createSearchQueryString(path: string, query: string, hitsCount: number, completionsCount: number) {
    return `${DBLP_URL}${path}?${query.length > 0 ? `q=${query}&` : ''}&h=${hitsCount}&f=0&c=${completionsCount}&format=json`;
}