import { PublicationsSearchParams } from '@/dtos/PublicationsSearchParams'
import { parseIntStrings } from './strings'
import { PublicationType } from '@/enums/PublicationType'

const UNDEFINED = 'undefined';
const AUTHOR_SEARCH_PARAM_KEY = 'authorId';
const VENUE_SEARCH_PARAM_KEY = 'venueId';
const YEAR_SEARCH_PARAM_KEY = 'year';
const TYPE_SEARCH_PARAM_KEY = 'type';

/**
 * Converts a list of author IDs to a string of search parameters that can be used in a publications page URL.
 * @param authorIds List of author IDs
 * @returns String of search parameters separated by '&'
 */
export function toAuthorsSearchParamsString(...authorIds: Array<string>) {
    return toSearchParamsString(AUTHOR_SEARCH_PARAM_KEY, authorIds);
}

/**
 * Converts a list of venue IDs to a string of search parameters that can be used in a publications page URL.
 * @param authorIds List of author IDs
 * @returns String of search parameters separated by '&'
 */
export function toVenuesSearchParamsString(...venueIds: Array<string | undefined>) {
    return toSearchParamsString(VENUE_SEARCH_PARAM_KEY, venueIds.map((id) => id || UNDEFINED));
}

/**
 * Converts a list of years to a string of search parameters that can be used in a publications page URL.
 * @param authorIds List of author IDs
 * @returns String of search parameters separated by '&'
 */
export function toYearsSearchParamsString(...years: Array<number>) {
    return toSearchParamsString(YEAR_SEARCH_PARAM_KEY, years.map((year) => year.toString()));
}

/**
 * Converts a list of publication types to a string of search parameters that can be used in a publications page URL.
 * @param authorIds List of author IDs
 * @returns String of search parameters separated by '&'
 */
export function toTypesSearchParamsString(...types: Array<PublicationType>) {
    return toSearchParamsString(TYPE_SEARCH_PARAM_KEY, types);
}

/**
 * Converts search parameters to specific lists of typed items.
 * @param params Parameters retreived from a URL
 * @returns Specific lists of typed items
 */
export function parsePublicationsSearchParams(params: PublicationsSearchParams) {
    const years = params.year ?
        parseIntStrings(params.year) :
        [];

    const types = params.type ?
        stringsToArray(params.type)
            .map((t) => Object.keys(PublicationType).some((k) => k === t) && t)
            .filter((t) => t) as Array<PublicationType> :
        [];

    const venues = params.venueId ?
        stringsToArray(params.venueId)
            .map((id) => id === UNDEFINED ? undefined : id) :
        [];

    const authors = params.authorId ?
        stringsToArray(params.authorId) :
        [];

    return {
        years,
        types,
        venues,
        authors
    };
}

function toSearchParamsString(key: string, values: Array<string>): string {
    return values.map((v) => `${key}=${v}`).join('&');
}

function stringsToArray(strings: Array<string> | string) {
    if (typeof strings === 'string') {
        return [strings];
    }
    else {
        return strings;
    }
}