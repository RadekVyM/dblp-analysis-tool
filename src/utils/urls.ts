import { SearchType } from '@/enums/SearchType'
import { normalizeQuery } from '@/utils/searchQuery'
import { SearchParams } from '@/dtos/search/SearchParams'
import { BOOKS_DBLP_KEY, CONF_DBLP_KEY, JOURNALS_DBLP_KEY, REFERENCE_DBLP_KEY, SERIES_DBLP_KEY } from '@/constants/search'
import { VenueType } from '@/enums/VenueType'
import { SEARCH_AUTHOR, SEARCH_VENUE, VENUE_PATH_SEGMENTS } from '@/constants/urls'
import { isNullOrWhiteSpace } from './strings'

const venueIdContainingUrlSegments = [JOURNALS_DBLP_KEY, CONF_DBLP_KEY, SERIES_DBLP_KEY, BOOKS_DBLP_KEY, REFERENCE_DBLP_KEY];
const idContainingUrlSegments = ['pid', ...venueIdContainingUrlSegments];

// This tool works with normalized author and venue IDs, also referred to as local IDs.
// These have slashes replaced by two underscores.
const ID_LOCAL_SEPARATOR = '__'; // Single '-' cannot be used, PIDs can contain '-'
const ID_DBLP_SEPARATOR = '/';

/**
 * Returns whether the URL contains an ID of an author or venue.
 * @param dblpUrl dblp URL
 * @returns Whether the URL contains an ID of an author or venue
 */
export function dblpUrlContainsItemId(dblpUrl: string): boolean {
    const path = getPath(dblpUrl);
    return idContainingUrlSegments.some((w) => path.includes(w));
}

/**
 * Finds out a venue type from a string. This string is typically a URL. If the type cannot be found out, null is returned.
 * @param str String containing a venue type identifier
 * @returns Venue type or null
 */
export function getVenueTypeFromDblpString(str: string): VenueType | null {
    for (const key of Object.keys(VenueType)) {
        const segment = VENUE_PATH_SEGMENTS[key as keyof typeof VenueType];

        if (str.toLowerCase().includes(segment))
            return key as keyof typeof VenueType;
    }

    return null;
}

/**
 * Extracts a normalized author or venue ID from the URL. If the URL contains both venue and volume ID, both are returned. If no ID is found, null is returned.
 * @param dblpUrl dblp URL
 * @returns Array of IDs or null
 */
export function extractNormalizedIdFromDblpUrl(dblpUrl: string): [string, string | null] | null {
    const path = getPath(dblpUrl);
    return extractNormalizedIdFromDblpUrlPath(path);
}

/**
 * Extracts a normalized author or venue ID from the URL path. If the URL contains both venue and volume ID, both are returned. If no ID is found, null is returned.
 * @param dblpUrlPath dblp URL path
 * @returns Array of normalized IDs or null
 */
export function extractNormalizedIdFromDblpUrlPath(dblpUrlPath: string): [string, string | null] | null {
    const segments = dblpUrlPath.split(ID_DBLP_SEPARATOR);
    const typeSegment = idContainingUrlSegments.find((w) => segments.includes(w));
    if (!typeSegment) {
        return null;
    }
    // Get part of the path containing typeSegment and segments with an ID
    const reducedSegments = segments.slice(segments.indexOf(typeSegment), segments.length);
    return convertDblpIdSegmentsToNormalizedId(reducedSegments);
}

/**
 * Normalizes an author or venue ID used in dblp.
 * @param dblpId Author or venue ID used in dblp
 * @returns Array of normalized IDs or null
 */
export function convertDblpIdToNormalizedId(dblpId: string): [string, string | null] | null {
    return convertDblpIdSegmentsToNormalizedId(dblpId.split(ID_DBLP_SEPARATOR));
}

/**
 * Converts a normalized author or venue ID to the format used in dblp.
 * @param normalizedId Normalized author or venue ID
 * @param followingNormalizedId Potential normalized venue volume ID
 * @returns ID in the format used in dblp
 */
export function convertNormalizedIdToDblpPath(normalizedId: string, followingNormalizedId: string | undefined | null = undefined): string {
    const firstPart = `/${normalizedId.replaceAll(ID_LOCAL_SEPARATOR, ID_DBLP_SEPARATOR)}`;

    if (followingNormalizedId) {
        return `${firstPart}/${followingNormalizedId.replaceAll(ID_LOCAL_SEPARATOR, ID_DBLP_SEPARATOR)}`;
    }

    return firstPart;
}

/**
 * Creates a URL path to a local search page.
 * @param searchType Type of searched item - author or venue
 * @param searchParams Search parameters
 * @returns URL path to a local search page
 */
export function createLocalSearchPath(searchType: SearchType, searchParams: SearchParams): string {
    if (searchParams.query) {
        searchParams.query = normalizeQuery(searchParams.query);
    }
    const params: { [key: string]: any } = searchParams;

    switch (searchType) {
        case SearchType.Author:
            return urlWithParams(SEARCH_AUTHOR, params);
        case SearchType.Venue:
            return urlWithParams(SEARCH_VENUE, params);
    }
}

/**
 * Creates a local URL path leading to a specific author, venue or venue volume.
 * @param normalizedId Normalized ID of an author or venue
 * @param searchType Type of the target item - author or venue
 * @param followingNormalizedId Potential normalized venue volume ID
 * @returns Local URL path to a specific author, venue or venue volume
 */
export function createLocalPath(normalizedId: string, searchType: SearchType, followingNormalizedId: string | undefined | null = undefined): string {
    const following = followingNormalizedId ?
        `/${followingNormalizedId}` :
        '';

    switch (searchType) {
        case SearchType.Author:
            return `/author/${normalizedId}${following}`;
        case SearchType.Venue:
            return `/venue/${normalizedId}${following}`;
    }
}

/**
 * Converts a dblp URL of an author, venue or venue volume to a local URL path.
 * @param dblpUrl dblp URL
 * @param searchType Type of the target item - author or venue
 * @returns Local URL path to a specific author, venue or venue volume
 */
export function convertDblpUrlToLocalPath(dblpUrl: string, searchType: SearchType): string | null {
    const [firstId, secondId] = extractNormalizedIdFromDblpUrl(dblpUrl) || [null, null];

    if (!firstId) {
        return null;
    }

    return createLocalPath(firstId, searchType, secondId);
}

/**
 * Appends search parameters to a URL.
 * @param inputUrl URL
 * @param inputParams Search parameters
 * @param ignoreExistingUrlParams Whether existing parameters of the URL should be ignored and removed
 * @returns URL with the specified search parameters
 */
export function urlWithParams(inputUrl: string, inputParams: { [key: string]: any }, ignoreExistingUrlParams: boolean = false) {
    const [url] = inputUrl.split('?');
    const params: { [key: string]: any } = ignoreExistingUrlParams ? {} : extractParamsFromUrl(inputUrl);

    Object.keys(inputParams).forEach((key) => params[key] = inputParams[key]);

    const paramsString = Object
        .keys(params)
        .map((key) => params[key] === undefined ?
            undefined :
            params[key] === null ?
                key :
                `${key}=${params[key]}`)
        .filter((p) => p)
        .join('&');

    return isNullOrWhiteSpace(paramsString) ?
        url :
        `${url}?${paramsString}`;
}

/**
 * Extracts search parameters from a URL.
 * @param inputUrl URL
 * @returns Search parameters
 */
export function extractParamsFromUrl(inputUrl: string) {
    const [url, inputStringParams] = inputUrl.split('?');
    const params: { [key: string]: any } = {};

    if (inputStringParams) {
        inputStringParams.split('&').map((w) => {
            const [key, value] = w.split('=');
            params[key] = value;
        })
    }

    return params;
}

/** Selects only IDs from path segments and normalizes them. */
function convertDblpIdSegmentsToNormalizedId(segments: Array<string>): [string, string | null] | null {
    let split = segments
        .map((w) => removeWords(['.html', '.bht', '.xml'], w))
        .filter((w) => w != 'index' && w.length > 0);
    let third: null | string = null;

    // If dblpId is a venue ID, take just first two segments
    if (split.some((s) => venueIdContainingUrlSegments.includes(s.toLowerCase()))) {
        third = split.length > 2 ? split[2] : null;
        split = split.slice(0, 2);
    }

    if (split.length < 2) {
        return null;
    }

    return [split.join(ID_LOCAL_SEPARATOR), third];
}

/** Returns just a path from a URL. */
function getPath(stringUrl: string) {
    const url = new URL(stringUrl);
    return url.pathname;
}

/** Removes specified words from the text. */
function removeWords(words: Array<string>, text: string) {
    let result = text;

    for (const word of words) {
        result = result.replace(word, '');
    }

    return result;
}