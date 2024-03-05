import 'server-only'
import { VenueType } from '@/enums/VenueType'
import { fetchItemsIndexHtml } from '@/services/items/fetch'
import { convertNormalizedIdToDblpPath } from '@/utils/urls'
import { DBLP_BOOKS_INDEX_HTML, DBLP_CONF_INDEX_HTML, DBLP_JOURNALS_INDEX_HTML, DBLP_REFERENCE_INDEX_HTML, DBLP_SERIES_INDEX_HTML, DBLP_URL } from '@/constants/urls'
import { extractVenueAuthorsInfo, extractVenueOrVolume, extractVenueYearlyPublications, extractVenuesIndex, extractVenuesIndexLength } from './parsing'
import { fetchSvg, fetchXml, withCache } from '@/services/fetch'
import { BaseSearchItemsParams, SearchItemsParams } from '@/dtos/search/SearchItemsParams'
import { delay, getFulfilledValueAt, getRejectedValueAt } from '@/utils/promises'
import { SimpleSearchResultItem, createSimpleSearchResult } from '@/dtos/search/SimpleSearchResult'
import { serverError } from '@/utils/errors'
import { DblpVenueBase } from '@/dtos/DblpVenueBase'
import { cacheVenueOrVolume, tryGetCachedVenueOrVolume } from '@/services/cache/venues'
import { VenueVolumeType } from '@/enums/VenueVolumeType'
import { DblpVenue } from '@/dtos/DblpVenue'
import { createDblpVenueAuthorsInfo } from '@/dtos/DblpVenueInfo'
import { createDblpVenuePublicationsInfo } from '@/dtos/DblpVenuePublicationsInfo'
import waitForNextFetch from '../waitForNextFetch'

const DBLP_HTML_INDEX_PATHS = {
    [VenueType.Journal]: DBLP_JOURNALS_INDEX_HTML,
    [VenueType.Conference]: DBLP_CONF_INDEX_HTML,
    [VenueType.Series]: DBLP_SERIES_INDEX_HTML,
    [VenueType.Book]: DBLP_BOOKS_INDEX_HTML,
    [VenueType.Reference]: DBLP_REFERENCE_INDEX_HTML,
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
export async function fetchVenueOrVolume(id: string, additionalVolumeId?: string, signal?: AbortSignal) {
    return await withCache<DblpVenueBase>(
        async (value: DblpVenueBase) => await cacheVenueOrVolume(value, id, additionalVolumeId),
        async () => await tryGetCachedVenueOrVolume(id, additionalVolumeId),
        async () => {
            await waitForNextFetch(signal);
            const xml = await fetchVenueOrVolumeXml(id, additionalVolumeId);
            const venueOrVolume = extractVenueOrVolume(xml, id, additionalVolumeId);

            if (venueOrVolume.venueVolumeType !== VenueVolumeType.Venue) {
                return venueOrVolume;
            }

            const venue = venueOrVolume as DblpVenue;
            return await tryFetchAdditionalVenueInfo(venue, id);
        }
    );
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

async function tryFetchAdditionalVenueInfo(venue: DblpVenue, id: string) {
    try {
        await delay(500); // Wait at least a bit to not send multiple requests at the same time
        const additionalVenueInfoXml = await fetchAdditionalVenueInfoXml(id);
        const authorsInfo = extractVenueAuthorsInfo(additionalVenueInfoXml);

        if (authorsInfo) {
            venue.venueAuthorsInfo = createDblpVenueAuthorsInfo(
                authorsInfo.topAuthors,
                authorsInfo.totalAuthorsCount
            );
        }
    }
    catch (e) {
        console.log(`Fetch of additional venue info failed. Error: ${e}`);
    }

    try {
        await delay(500); // Wait at least a bit to not send multiple requests at the same time
        const yearlyPublicationsSvg = await fetchVenueYearlyPublicationsSvg(id);
        const yearlyPublications = extractVenueYearlyPublications(yearlyPublicationsSvg);

        if (yearlyPublications) {
            venue.venuePublicationsInfo = createDblpVenuePublicationsInfo(
                yearlyPublications
            );
        }
    }
    catch (e) {
        console.log(`Fetch of venue yearly publications stats failed. Error: ${e}`);
    }

    return venue;
}

/** Fetches a raw XML object containing all the venue or venue volume information. */
async function fetchVenueOrVolumeXml(id: string, additionalVolumeId?: string): Promise<string> {
    const url = additionalVolumeId ?
        `${DBLP_URL}/db${convertNormalizedIdToDblpPath(id)}/${additionalVolumeId}.xml` :
        `${DBLP_URL}/db${convertNormalizedIdToDblpPath(id)}/index.xml`;
    return fetchXml(url);
}

async function fetchAdditionalVenueInfoXml(id: string): Promise<string> {
    const url = `${DBLP_URL}/search/publ/api?q=stream:${convertNormalizedIdToDblpPath(id).substring(1)}:&compl=author&p=0&h=0&c=1000&format=xml`;
    console.log(url)
    return fetchXml(url);
}

async function fetchVenueYearlyPublicationsSvg(id: string): Promise<string> {
    const url = `${DBLP_URL}/search/yt/svg?q=stream:${convertNormalizedIdToDblpPath(id).substring(1)}:`;
    return fetchSvg(url);
}