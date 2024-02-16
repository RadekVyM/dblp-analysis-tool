import { SearchItemsParams } from '@/dtos/search/SearchItemsParams'
import { isNumber } from './strings'
import { SearchParams } from '@/dtos/search/SearchParams'

/**
 * Converts search parameters obtained from the URL to search items parameters that can be used to query items from DBLP.
 * @param searchParams Search parameters obtained from the URL
 * @param count How many items should be queried
 * @returns Search items parameters
 */
export function searchToItemsParams(searchParams: SearchParams, count: number): SearchItemsParams {
    const query = searchParams.query;
    const type = searchParams.type;
    const page = getPageFromSearchParams(searchParams);

    return {
        query: query,
        first: (page - 1) * count,
        count: count,
        type: type
    } as SearchItemsParams;
}

/**
 * Gets a page number from search parameters obtained from the URL. If no page is found in the parameters, returns 1. 
 * @param searchParams Search parameters obtained from the URL
 * @returns Page number
 */
export function getPageFromSearchParams(searchParams: SearchParams): number {
    const page = searchParams.page || '1';
    return page && isNumber(page) ? parseInt(page) : 1;
}