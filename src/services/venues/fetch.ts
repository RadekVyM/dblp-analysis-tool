import { VenueType } from '@/enums/VenueType'
import { DBLP_SEARCH_VENUE_API, DBLP_URL } from '@/constants/urls'
import { fetchItemsJson } from '@/services/items/fetch'
import { VenueSearchHit, createSearchResultFromRaw } from '@/dtos/search/SearchResult'
import { CONF_DBLP_SEARCH_TYPE, JOURNALS_DBLP_SEARCH_TYPE, MAX_QUERYABLE_ITEMS_COUNT, SERIES_DBLP_SEARCH_TYPE } from '@/constants/search'
import { SearchItemsParams, SearchVenuesParams } from '@/dtos/search/SearchItemsParams'
import { SimpleSearchResult, createSimpleSearchResult } from '@/dtos/search/SimpleSearchResult'
import { SearchType } from '@/enums/SearchType'
import { RawBaseSearchResult } from '@/dtos/search/RawSearchResult'

/**
 * Requests venues from a JSON dblp endpoint.
 * Used mainly for searching the database.
 * 
 * It is not possible to get more than first 10000 satisfactory results.
 * This is a limit set by dblp.
 * @param params Parameters which affect what items are returned
 * @param type Venue type
 * @returns Raw deserialized JSON object
 */
export async function fetchVenues(params: SearchVenuesParams, type?: VenueType): Promise<RawBaseSearchResult> {
    const query = type ? `${getQueryPrefix(type)}${params.query || ''}` : params.query;
    return fetchItemsJson(`${DBLP_URL}${DBLP_SEARCH_VENUE_API}`, { ...params, query: query }).then(data => data as RawBaseSearchResult);
}

/**
 * Requests venues from a JSON dblp endpoint.
 * Used mainly for searching the database by the title of a venue.
 * 
 * @param type Venue type
 * @param params Parameters which affect what items are returned
 * @returns Processed search result containg a list of found authors
 */
export async function fetchSearchResultWithQuery(
    type: VenueType,
    params: SearchItemsParams
): Promise<SimpleSearchResult> {
    const response = await fetchVenues(params, type);
    const authors = createSearchResultFromRaw<VenueSearchHit>(response, SearchType.Venue);
    const count = Math.min(authors.hits.total, MAX_QUERYABLE_ITEMS_COUNT);
    const result = createSimpleSearchResult(
        count,
        authors.hits.items.map((item) => ({
            title: item.info.venue,
            localUrl: item.info.localUrl
        })));

    return result;
}

/** Returns a prefix of a query based on the venue type */
function getQueryPrefix(type: VenueType): string {
    const searchType = {
        [VenueType.Journal]: JOURNALS_DBLP_SEARCH_TYPE,
        [VenueType.Conference]: CONF_DBLP_SEARCH_TYPE,
        [VenueType.Series]: SERIES_DBLP_SEARCH_TYPE,
    }[type];

    return `type:${searchType}:`;
}