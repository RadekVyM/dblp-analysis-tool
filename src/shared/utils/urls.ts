import { SearchType } from "@/shared/enums/SearchType";
import { normalizeQuery } from "./searchQuery";
import { CONF_DBLP_KEY, JOURNALS_DBLP_KEY, SERIES_DBLP_KEY, VenueType } from "../enums/VenueType";

type SearchParams = {
    q?: string,
    type?: string
}

const venueIdContainingUrlSegments = [JOURNALS_DBLP_KEY, CONF_DBLP_KEY, SERIES_DBLP_KEY];
const idContainingUrlSegments = ['pid', ...venueIdContainingUrlSegments];

export const ID_LOCAL_SEPARATOR = '___'; // Do not used single '-'. PIDs can contain '-'
export const ID_DBLP_SEPARATOR = '/';

export function dblpUrlContainsItemId(stringUrl: string) {
    const path = getPath(stringUrl);
    return idContainingUrlSegments.some((w) => path.includes(w));
}

export function getVenueTypeFromDdlpUrl(dblpUrl: string) {
    for (const key of Object.keys(VenueType)) {
        const venue = VenueType[key as keyof typeof VenueType];

        if (dblpUrl.includes(venue))
            return venue;
    }

    return null;
}

export function extractNormalizedIdFromDblpUrl(dblpUrl: string) {
    const path = getPath(dblpUrl);
    const typeSegment = idContainingUrlSegments.find((w) => path.includes(w));
    if (!typeSegment) {
        return null;
    }
    const reducedPath = path.substring(path.indexOf(typeSegment) + typeSegment.length);
    const id = removeWords(['index.html'], reducedPath);

    return `${typeSegment}${ID_LOCAL_SEPARATOR}${id
        .split(ID_DBLP_SEPARATOR)
        .filter((w) => w.length > 0)
        .join(ID_LOCAL_SEPARATOR)}`;
}

export function createLocalSearchPath(searchType: SearchType, searchParams: SearchParams) {
    searchParams.q = searchParams.q ? normalizeQuery(searchParams.q) : undefined;
    const params: { [key: string]: any } = searchParams;

    switch (searchType) {
        case SearchType.Author:
            return urlWithParams('/search/author', params);
        case SearchType.Venue:
            return urlWithParams('/search/venue', params);
    }
}

export function convertDblpUrlToLocalPath(dblpUrl: string, searchType: SearchType) {
    const id = extractNormalizedIdFromDblpUrl(dblpUrl);

    if (!id) {
        return null;
    }

    switch (searchType) {
        case SearchType.Author:
            return `/author/${id}`;
        case SearchType.Venue:
            const venueType = getVenueTypeFromDdlpUrl(dblpUrl);
            return `/venue/${venueType}/${id}`;
    }
}

export function extractParamsFromUrl(inputUrl: string) {
    const [url, inputStringParams] = inputUrl.split('?');
    const params: { [key: string]: any } = {};

    if (inputStringParams) {
        inputStringParams.split('&').map((w) => {
            const [key, value] = w.split('=');
            params[key] = value
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