import { SearchParams } from '@/dtos/search/SearchParams'
import { getPageFromSearchParams, searchToItemsParams } from '@/utils/searchParams'
import { describe, expect, test } from '@jest/globals'

type PageFromSearchParamsValue = [params: SearchParams, expectedPage: number]

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