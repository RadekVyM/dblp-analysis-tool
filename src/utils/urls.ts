import { SearchType } from '@/enums/SearchType'
import { normalizeQuery } from '@/utils/searchQuery'
import { SearchParams } from '@/models/SearchParams'
import { CONF_DBLP_KEY, JOURNALS_DBLP_KEY, SERIES_DBLP_KEY } from '@/constants/search'
import { VenueType } from '@/enums/VenueType'
import { SEARCH_AUTHOR, SEARCH_VENUE, VENUE_PATH_SEGMENTS } from '@/constants/urls'
import { isNullOrWhiteSpace } from './strings'

const venueIdContainingUrlSegments = [JOURNALS_DBLP_KEY, CONF_DBLP_KEY, SERIES_DBLP_KEY];
const idContainingUrlSegments = ['pid', ...venueIdContainingUrlSegments];

const ID_LOCAL_SEPARATOR = '___'; // Cannot use single '-', PIDs can contain '-'
const ID_DBLP_SEPARATOR = '/';

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
    const segments = dblpUrlPath.split(ID_DBLP_SEPARATOR);
    const typeSegment = idContainingUrlSegments.find((w) => segments.includes(w));
    if (!typeSegment) {
        return null;
    }
    // Get part of the path containing typeSegment and segments with an ID
    const reducedSegments = segments.slice(segments.indexOf(typeSegment), segments.length);
    return convertDblpIdSegmentsToNormalizedId(reducedSegments);
}

export function convertDblpIdToNormalizedId(dblpId: string): [string, string | null] | null {
    return convertDblpIdSegmentsToNormalizedId(dblpId.split(ID_DBLP_SEPARATOR));
}

export function convertNormalizedIdToDblpPath(normalizedId: string, followingNormalizedId: string | undefined | null = undefined) {
    const firstPart = `/${normalizedId.replaceAll(ID_LOCAL_SEPARATOR, ID_DBLP_SEPARATOR)}`

    if (followingNormalizedId) {
        return `${firstPart}/${followingNormalizedId.replaceAll(ID_LOCAL_SEPARATOR, ID_DBLP_SEPARATOR)}`
    }

    return firstPart;
}

export function createLocalSearchPath(searchType: SearchType, searchParams: SearchParams) {
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

export function createLocalPath(normalizedId: string, searchType: SearchType, followingNormalizedId: string | undefined | null = undefined) {
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

export function convertDblpUrlToLocalPath(dblpUrl: string, searchType: SearchType) {
    const [firstId, secondId] = extractNormalizedIdFromDblpUrl(dblpUrl) || [null, null];

    if (!firstId) {
        return null;
    }

    return createLocalPath(firstId, searchType, secondId);
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

    Object.keys(inputParams).forEach((key) => params[key] = inputParams[key]);

    const paramsString = Object
        .keys(params)
        .map((key) => params[key] == undefined ? key : `${key}=${params[key]}`)
        .filter((p) => p)
        .join('&');

    return isNullOrWhiteSpace(paramsString) ?
        url :
        `${url}?${paramsString}`;
}

function convertDblpIdSegmentsToNormalizedId(segments: Array<string>): [string, string | null] | null {
    let split = segments
        .map((w) => removeWords(['.html', '.bht', '.xml'], w))
        .filter((w) => w != 'index' && w.length > 0);
    let third: null | string = null;

    // If dblpId is a venue ID, take just first two segments (ignore volume ID)
    if (split.some((s) => venueIdContainingUrlSegments.includes(s.toLowerCase()))) {
        third = split.length > 2 ? split[2] : null;
        split = split.slice(0, 2);
    }

    if (split.length < 2) {
        return null;
    }

    return [split.join(ID_LOCAL_SEPARATOR), third];
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