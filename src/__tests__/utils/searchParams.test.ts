import { SearchItemsParams } from '@/dtos/search/SearchItemsParams';
import { SearchParams } from '@/dtos/search/SearchParams'
import { getPageFromSearchParams, searchToItemsParams } from '@/utils/searchParams'
import { describe, expect, test } from '@jest/globals'

type PageFromSearchParamsValue = [params: SearchParams, expectedPage: number]

describe('searchToItemsParams function', () => {
    const values: Array<[{ params: SearchParams, count: number }, SearchItemsParams]> = [
        [{ params: { query: 'hello', type: 'Author' }, count: 5 }, { first: 0, count: 5, query: 'hello', type: 'Author' }],
        [{ params: { page: '1', query: 'hello', type: 'Author' }, count: 5 }, { first: 0, count: 5, query: 'hello', type: 'Author' }],
        [{ params: { page: '2', query: 'hello', type: 'Author' }, count: 5 }, { first: 5, count: 5, query: 'hello', type: 'Author' }],
    ];

    for (const [value, expectedParams] of values) {
        test(`got ${JSON.stringify(expectedParams)} from ${JSON.stringify(value)}`, () => {
            expect(searchToItemsParams(value.params, value.count)).toEqual(expectedParams);
        });
    }
});

describe('getPageFromSearchParams function', () => {
    const values: Array<PageFromSearchParamsValue> = [
        [{}, 1],
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