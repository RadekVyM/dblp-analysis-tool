import { SearchType } from '@/shared/enums/SearchType'
import { normalizeQuery } from './searchQuery'
import { SearchParams } from '../models/SearchParams'
import { CONF_DBLP_KEY, JOURNALS_DBLP_KEY, SERIES_DBLP_KEY } from '../constants/search'
import { VenueType } from '../enums/VenueType'

const venueIdContainingUrlSegments = [JOURNALS_DBLP_KEY, CONF_DBLP_KEY, SERIES_DBLP_KEY];
const idContainingUrlSegments = ['pid', ...venueIdContainingUrlSegments];

const ID_LOCAL_SEPARATOR = '___'; // Do not use single '-', PIDs can contain '-'
const ID_DBLP_SEPARATOR = '/';

export const VENUE_PATH_SEGMENTS = {
    [VenueType.Journal]: JOURNALS_DBLP_KEY,
    [VenueType.Conference]: CONF_DBLP_KEY,
    [VenueType.Series]: SERIES_DBLP_KEY,
} as const

export function dblpUrlContainsItemId(stringUrl: string) {
    const path = getPath(stringUrl);
    return idContainingUrlSegments.some((w) => path.includes(w));
}

export function getVenueTypeFromString(str: string) {
    for (const key of Object.keys(VenueType)) {
        const segment = VENUE_PATH_SEGMENTS[key as keyof typeof VenueType];

        if (str.toLowerCase().includes(segment))
            return key as keyof typeof VenueType;
    }

    return null;
}

export function extractNormalizedIdFromDblpUrl(dblpUrl: string) {
    const path = getPath(dblpUrl);
    return extractNormalizedIdFromDblpUrlPath(path);
}

export function extractNormalizedIdFromDblpUrlPath(dblpUrlPath: string) {
    const typeSegment = idContainingUrlSegments.find((w) => dblpUrlPath.toLowerCase().includes(w));
    if (!typeSegment) {
        return null;
    }
    // Get part of the path containing typeSegment and segments with an ID
    const reducedPath = dblpUrlPath.substring(dblpUrlPath.indexOf(typeSegment));
    const id = removeWords(['index.html', '.html', 'index.bht', '.bht'], reducedPath);

    const result = convertDblpIdToNormalizedId(id);
    return result;
}

export function convertDblpIdToNormalizedId(dblpId: string) {
    let split = dblpId
        .split(ID_DBLP_SEPARATOR)
        .filter((w) => w.length > 0);

    // If dblpId is a venue ID, take just first two segments (ignore volume ID)
    if (split.some((s) => venueIdContainingUrlSegments.includes(s.toLowerCase()))) {
        split = split.slice(0, 2);
    }

    return split.join(ID_LOCAL_SEPARATOR);
}

export function convertNormalizedIdToDblpPath(normalizedId: string) {
    return `/${normalizedId.replaceAll(ID_LOCAL_SEPARATOR, ID_DBLP_SEPARATOR)}`;
}

export function createLocalSearchPath(searchType: SearchType, searchParams: SearchParams) {
    searchParams.query = searchParams.query ? normalizeQuery(searchParams.query) : undefined;
    const params: { [key: string]: any } = searchParams;

    switch (searchType) {
        case SearchType.Author:
            return urlWithParams('/search/author', params);
        case SearchType.Venue:
            return urlWithParams('/search/venue', params);
    }
}

export function createLocalPath(normalizedId: string, searchType: SearchType) {
    switch (searchType) {
        case SearchType.Author:
            return `/author/${normalizedId}`;
        case SearchType.Venue:
            return `/venue/${normalizedId}`;
    }
}

export function convertDblpUrlToLocalPath(dblpUrl: string, searchType: SearchType) {
    const id = extractNormalizedIdFromDblpUrl(dblpUrl);

    if (!id) {
        return null;
    }

    return createLocalPath(id, searchType);
}

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

export function urlWithParams(inputUrl: string, inputParams: { [key: string]: any }, ignoreExistingUrlParams: boolean = false) {
    const [url] = inputUrl.split('?');
    const params: { [key: string]: any } = ignoreExistingUrlParams ? {} : extractParamsFromUrl(inputUrl);

    Object.keys(inputParams).map((key) => params[key] = inputParams[key]);

    const paramsString = Object
        .keys(params)
        .map((key) => params[key] == undefined ? undefined : `${key}=${params[key]}`)
        .filter((p) => p)
        .join('&');

    return `${url}?${paramsString}`
}

function getPath(stringUrl: string) {
    const url = new URL(stringUrl);
    return url.pathname;
}

function removeWords(words: Array<string>, text: string) {
    let result = text;

    for (const word of words) {
        result = result.replace(word, '');
    }

    return result;
}