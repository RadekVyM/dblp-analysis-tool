import { SearchType } from "@/shared/enums/SearchType";
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

export function createSearchUrl(query: string, type: SearchType) {
    const normalized = normalizeQuery(query);

    switch (type) {
        case SearchType.Author:
            return `/search/author?q=${normalized}`;
        case SearchType.Venue:
            return `/search/venue?q=${normalized}`;
    }
}

export function createLocalUrl(dblpUrl: string, type: SearchType) {
    switch (type) {
        case SearchType.Author:
            return `/author/${extractNormalizedId(dblpUrl)}`;
        case SearchType.Venue:
            return `/venue/${extractNormalizedId(dblpUrl)}`;
    }
}