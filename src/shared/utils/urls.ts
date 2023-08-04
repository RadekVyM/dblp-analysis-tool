import { DbplSearchType } from "@/shared/dtos/DbplSearchType";
import { normalizeQuery } from "./searchQuery";

export const ID_LOCAL_SEPARATOR = '_';
export const ID_DBLP_SEPARATOR = '/';

export function extractNormalizedId(url: string) {
    return url
        .replace('https://', '')
        .replace('http://', '')
        .replace('dblp.org/', '')
        .replace('pid/', '')
        .replace('db/', '')
        .replace('.html', '')
        .replace(ID_DBLP_SEPARATOR, ID_LOCAL_SEPARATOR);
}

export function createSearchUrl(query: string, type: DbplSearchType | undefined = undefined) {
    const normalized = normalizeQuery(query);

    switch (type) {
        case DbplSearchType.Author:
            return `/search/author?q=${normalized}`;
        case DbplSearchType.Venue:
            return `/search/venue?q=${normalized}`;
        case undefined:
            return `/search?q=${normalized}`;
    }
}

export function createLocalUrl(dblpUrl: string, type: DbplSearchType) {
    switch (type) {
        case DbplSearchType.Author:
            return `/author/${extractNormalizedId(dblpUrl)}`;
        case DbplSearchType.Venue:
            return `/venue/${extractNormalizedId(dblpUrl)}`;
    }
}