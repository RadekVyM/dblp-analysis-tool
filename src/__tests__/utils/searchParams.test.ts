import { SearchParams } from '@/models/SearchParams'
import { SearchItemsParams } from '@/models/searchItemsParams'
import { getPageFromSearchParams, searchToItemsCountParams, searchToItemsParams } from '@/utils/searchParams'
import { describe, expect, test } from '@jest/globals'

type PageFromSearchParamsValue = [params: SearchParams, expectedPage: number]

type SearchToItemsCountParamsValue = [params: SearchParams, expectedParams: SearchItemsParams]

describe('getPageFromSearchParams function', () => {
    const values: Array<PageFromSearchParamsValue> = [
        [{ }, 1],
        [{ page: '' }, 1],
        [{ page: ' ' }, 1],
        [{ page: 'abc' }, 1],
        [{ page: '1' }, 1],
        [{ page: '48' }, 48],
    ];

    for (const [params, expectedPage] of values) {
        test(`got ${expectedPage} from ${JSON.stringify(params)}`, () => {
            expect(getPageFromSearchParams(params)).toBe(expectedPage);
        });
    }
});

describe('searchToItemsCountParams function', () => {
    const values: Array<SearchToItemsCountParamsValue> = [
        [{}, { query: undefined, first: 1, count: 0, completionsCount: 0 }],
        [{ query: '' }, { query: '', first: 1, count: 0, completionsCount: 0 }],
        [{ query: 'hello' }, { query: 'hello', first: 1, count: 0, completionsCount: 0 }],
    ];

    for (const [params, expectedParams] of values) {
        test(`got ${JSON.stringify(expectedParams)} from ${JSON.stringify(params)}`, () => {
            expect(searchToItemsCountParams(params)).toEqual(expectedParams);
        });
    }
});
