import { SearchParams } from '../models/SearchParams'
import { ItemsParams } from '../fetching/shared'
import { isNumber } from './strings'

export function searchToItemsParams(searchParams: SearchParams, count: number) {
    const query = searchParams.query;
    const type = searchParams.type;
    const page = getPageFromSearchParams(searchParams);

    return {
        query: query,
        first: (page - 1) * count,
        count: count,
        type: type
    } as ItemsParams
}

export function getPageFromSearchParams(searchParams: SearchParams) {
    const page = searchParams.page || '1';
    return page && isNumber(page) ? parseInt(page) : 1;
}

export function searchToItemsCountParams(searchParams: SearchParams) {
    const query = searchParams.query;

    return {
        query: query,
        first: 1,
        count: 0,
        completionsCount: 0
    } as ItemsParams
}