'use client'

import { DblpAuthorSearchHit, BaseDblpSearchHit, DblpSearchResult, RawDblpBaseSearchResult, DblpVenueSearchHit } from '@/dtos/DblpSearchResult'
import { DbplSearchType } from '@/dtos/DbplSearchType';
import useSWR, { Fetcher } from 'swr'

const DBLP_URL = 'https://dblp.org';
const DBLP_SEARCH_AUTHOR_API = '/search/author/api';
const DBLP_SEARCH_VENUE_API = '/search/venue/api';

function createSearchFetcher<HitT extends BaseDblpSearchHit>(type: DbplSearchType) {
    return (input: string) => {
        if (!input.includes('q='))
            return null;

        return fetch(input).then(res =>
            res.json().then(data => new DblpSearchResult<HitT>(data as RawDblpBaseSearchResult, type)))
    };
}

const authorsSearchFetcher: Fetcher<DblpSearchResult<DblpAuthorSearchHit> | null, string> = createSearchFetcher<DblpAuthorSearchHit>(DbplSearchType.Author);
const venuesSearchFetcher: Fetcher<DblpSearchResult<DblpVenueSearchHit> | null, string> = createSearchFetcher<DblpVenueSearchHit>(DbplSearchType.Venue);

export function useAuthorsSearch(query: string, hitsCount: number = 5, completionsCount: number = 5) {
    const queryString = `${DBLP_URL}${DBLP_SEARCH_AUTHOR_API}?${query.length > 0 ? `q=${query}&` : ''}h=${hitsCount}&f=0&c=${completionsCount}&format=json`;
    const { data, error, isLoading } = useSWR(queryString, authorsSearchFetcher);

    return {
        authors: data,
        isLoading,
        isError: error
    }
}

export function useVenuesSearch(query: string, hitsCount: number = 5, completionsCount: number = 5) {
    const queryString = `${DBLP_URL}${DBLP_SEARCH_VENUE_API}?${query.length > 0 ? `q=${query}&` : ''}&h=${hitsCount}&f=0&c=${completionsCount}&format=json`;
    const { data, error, isLoading } = useSWR(queryString, venuesSearchFetcher);

    return {
        venues: data,
        isLoading,
        isError: error
    }
}