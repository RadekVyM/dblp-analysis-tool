import 'server-only'
import { VenueType } from '@/enums/VenueType'
import { fetchItemsIndexHtml } from '@/services/items/fetch'
import { convertNormalizedIdToDblpPath } from '@/utils/urls'
import { DBLP_BOOKS_INDEX_HTML, DBLP_CONF_INDEX_HTML, DBLP_JOURNALS_INDEX_HTML, DBLP_SERIES_INDEX_HTML, DBLP_URL } from '@/constants/urls'
import { extractVenueOrVolume, extractVenuesIndex, extractVenuesIndexLength } from './parsing'
import { fetchXml } from '@/services/fetch'
import { BaseSearchItemsParams, SearchItemsParams } from '@/dtos/search/SearchItemsParams'
import { getFulfilledValueAt, getRejectedValueAt } from '@/utils/promises'
import { SimpleSearchResultItem, createSimpleSearchResult } from '@/dtos/search/SimpleSearchResult'
import { serverError } from '@/utils/errors'

const DBLP_HTML_INDEX_PATHS = {
    [VenueType.Journal]: DBLP_JOURNALS_INDEX_HTML,
    [VenueType.Conference]: DBLP_CONF_INDEX_HTML,
    [VenueType.Series]: DBLP_SERIES_INDEX_HTML,
    [VenueType.Book]: DBLP_BOOKS_INDEX_HTML
} as const

/**
 * Requests a part of the venues index.
 * @param params Parameters which affect what part of the index is returned
 * @returns List of all venues in that part of the index
 */
export async function fetchVenuesIndex(type: VenueType, params: BaseSearchItemsParams) {
    const path = DBLP_HTML_INDEX_PATHS[type];
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${path}`, params);

    return extractVenuesIndex(html, type, params.count);
}

/**
 * Requests the authors index length.
 * @param type Venue type
 * @returns Authors index length
 */
export async function fetchVenuesIndexLength(type: VenueType) {
    const path = DBLP_HTML_INDEX_PATHS[type];
    // With the 'za' prefix, I get the last page of the index
    // There is a posibility that this will be a source of problems in the future
    // It is not a critical feature however
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${path}`, { prefix: 'za' });
    return extractVenuesIndexLength(html, type);
}

/**
 * Requests all the venue or venue volume information with a specified ID.
 * Some venues are not divided into multiple volumes.
 * These venues are perceived by this app as if they are volumes.
 * 
 * Results are cached.
 * @param id Normalized ID of the venue
 * @param additionalVolumeId Normalized ID of the venue volume
 * @returns Object containing all the venue or venue volume information
 */
export async function fetchVenueOrVolume(id: string, additionalVolumeId?: string) {
    const xml = await fetchVenueOrVolumeXml(id, additionalVolumeId);
    return extractVenueOrVolume(xml, id);
}

/**
 * Requests a part of the venues index and returns its entire length.
 * It is not possible to search by a venue's title.
 * 
 * @param type Venue type
 * @param params Parameters which affect what items are returned
 * @param itemsCount Max number of venues that can be returned
 * @returns Processed search result containg a list of found venues
 */
export async function fetchSearchResultWithoutQuery(type: VenueType, params: SearchItemsParams, itemsCount: number) {
    const promises = [
        fetchVenuesIndex(type, { first: params.first, count: itemsCount }),
        fetchVenuesIndexLength(type)
    ];

    const results = await Promise.allSettled(promises);
    const venues = getFulfilledValueAt<Array<SimpleSearchResultItem>>(results, 0);
    const count = getFulfilledValueAt<number>(results, 1);

    if (!venues) {
        const error = getRejectedValueAt<Error>(results, 0);
        console.error(error);
        throw serverError('Venues could not be fetched.');
    }

    if (!count && count != 0) {
        const error = getRejectedValueAt<Error>(results, 1);
        console.error(error);
        throw serverError('Venues count could not be fetched.');
    }

    const result = createSimpleSearchResult(count, venues);

    return result;
}

/** Fetches a raw XML object containing all the venue or venue volume information. */
async function fetchVenueOrVolumeXml(id: string, additionalVolumeId?: string): Promise<string> {
    const url = additionalVolumeId ?
        `${DBLP_URL}/db${convertNormalizedIdToDblpPath(id)}/${additionalVolumeId}.xml` :
        `${DBLP_URL}/db${convertNormalizedIdToDblpPath(id)}/index.xml`;
    return fetchXml(url);
}