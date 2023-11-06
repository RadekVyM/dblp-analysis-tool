import { VenueType } from '@/enums/VenueType'
import { fetchItemsIndexHtml } from '@/services/items/items'
import { convertNormalizedIdToDblpPath } from '@/utils/urls'
import { DBLP_CONF_INDEX_HTML, DBLP_JOURNALS_INDEX_HTML, DBLP_SEARCH_VENUE_API, DBLP_SERIES_INDEX_HTML, DBLP_URL } from '@/constants/urls'
import { extractVenue, extractVenuesIndex, extractVenuesIndexLength } from './parsing'
import { queryItemsJson } from '@/services/items/items'
import { fetchXml } from '@/services/fetch'
import { DblpSearchResult, DblpVenueSearchHit, RawDblpBaseSearchResult } from '@/dtos/DblpSearchResult'
import { CONF_DBLP_SEARCH_TYPE, DEFAULT_ITEMS_COUNT_PER_PAGE, JOURNALS_DBLP_SEARCH_TYPE, MAX_QUERYABLE_ITEMS_COUNT, SERIES_DBLP_SEARCH_TYPE } from '@/constants/search'
import { BaseSearchItemsParams, SearchItemsParams, SearchVenuesParams } from '@/dtos/searchItemsParams'
import { getFulfilledValueAt, getRejectedValueAt } from '@/utils/promises'
import { SimpleSearchResult, SimpleSearchResultItem } from '@/dtos/SimpleSearchResult'
import { SearchType } from '@/enums/SearchType'

const DBLP_HTML_INDEX_PATHS = {
    [VenueType.Journal]: DBLP_JOURNALS_INDEX_HTML,
    [VenueType.Conference]: DBLP_CONF_INDEX_HTML,
    [VenueType.Series]: DBLP_SERIES_INDEX_HTML,
} as const

export async function queryVenues(params: SearchVenuesParams, type?: VenueType) {
    const query = type ? `${getQueryPrefix(type)}${params.query || ''}` : params.query;
    return queryItemsJson(`${DBLP_URL}${DBLP_SEARCH_VENUE_API}`, {...params, query: query }).then(data => data as RawDblpBaseSearchResult);
}

export async function fetchVenuesIndex(type: VenueType, params: BaseSearchItemsParams) {
    const path = DBLP_HTML_INDEX_PATHS[type];
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${path}`, params);
    
    return extractVenuesIndex(html, type, params.count);
}

export async function fetchVenuesIndexLength(type: VenueType) {
    const path = DBLP_HTML_INDEX_PATHS[type];
    // With that prefix, I get to the last page of the index
    // There is a posibility that this will be a source of problems in the future
    // It is not a critical feature however
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${path}`, { prefix: 'za' });

    return extractVenuesIndexLength(html, type);
}

export async function fetchVenue(id: string) {
    const xml = await fetchVenueXml(id);
    return extractVenue(xml, id);
}

export async function getSearchResultWithQuery(type: VenueType, params: SearchItemsParams) {
    const response = await queryVenues(params, type);
    const authors = new DblpSearchResult<DblpVenueSearchHit>(response, SearchType.Venue);
    const count = Math.min(authors.hits.total, MAX_QUERYABLE_ITEMS_COUNT);
    const result = new SimpleSearchResult(
        count,
        authors.hits.items.map((item) => {
            return {
                title: item.info.venue,
                localUrl: item.info.localUrl
            }
        }));

    return result;
}

export async function getSearchResultWithoutQuery(type: VenueType, params: SearchItemsParams, itemsCount: number) {
    const promises = [
        fetchVenuesIndex(type, { first: params.first, count: DEFAULT_ITEMS_COUNT_PER_PAGE }),
        fetchVenuesIndexLength(type)
    ]

    const results = await Promise.allSettled(promises);
    const venues = getFulfilledValueAt<Array<SimpleSearchResultItem>>(results, 0);
    const count = getFulfilledValueAt<number>(results, 1);

    if (!venues) {
        const error = getRejectedValueAt<Error>(results, 0);
        throw error?.cause as Error;
    }

    if (!count && count != 0) {
        const error = getRejectedValueAt<Error>(results, 1);
        throw error?.cause as Error;
    }

    const result = new SimpleSearchResult(count, venues);

    return result;
}

async function fetchVenueXml(id: string) {
    const url = `${DBLP_URL}/db${convertNormalizedIdToDblpPath(id)}/index.xml`;
    return fetchXml(url);
}

async function fetchVenueVolumeXml(id: string, volume: string) {
    const url = `${DBLP_URL}/db${convertNormalizedIdToDblpPath(id)}/${volume}.xml`;
    return fetchXml(url);
}

function getQueryPrefix(type: VenueType) {
    const searchType = {
        [VenueType.Journal]: JOURNALS_DBLP_SEARCH_TYPE,
        [VenueType.Conference]: CONF_DBLP_SEARCH_TYPE,
        [VenueType.Series]: SERIES_DBLP_SEARCH_TYPE,
    }[type];
    
    return `type:${searchType}:`;
}