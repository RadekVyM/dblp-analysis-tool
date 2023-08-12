import { ItemsParams } from '@/shared/fetching/shared'
import { isNumber } from '@/shared/utils/numbers';

export const ITEMS_COUNT_PER_PAGE = 50;

export function searchToItemsParams(searchParams: any) {
    const query = searchParams['q'];
    const page = getPageFromParams(searchParams);

    return {
        query: query,
        first: (page - 1) * ITEMS_COUNT_PER_PAGE,
        count: ITEMS_COUNT_PER_PAGE
    } as ItemsParams
}

export function getPageFromParams(searchParams: any) {
    const page = searchParams['page'];
    return page && isNumber(page) ? parseInt(page) : 1;
}

export function searchToItemsCountParams(searchParams: any) {
    const query = searchParams['q'];

    return {
        query: query,
        first: 1,
        count: 0,
        completionsCount: 0
    } as ItemsParams
}
