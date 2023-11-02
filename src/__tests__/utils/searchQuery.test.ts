import { SearchQueryOptions } from '@/dtos/SearchQueryOptions';
import { normalizeQuery } from '@/utils/searchQuery'
import { describe, expect, test } from '@jest/globals'

type NormalizeQueryValue = [query: string, options: SearchQueryOptions | undefined, expectedResult: string]

describe('normalizeQuery function', () => {
    const values: Array<NormalizeQueryValue> = [
        ['', undefined, ''],
        ['abc', undefined, 'abc'],
        [' ', undefined, ' '],
        ['', { exactWords: true }, ''],
        [' ', { exactWords: true }, ' '],
        ['abc', { exactWords: true }, 'abc$'],
        [' abc ', { exactWords: true }, 'abc$'],
        ['abc def', { exactWords: true }, 'abc$ def$'],
        ['  abc def  ', { exactWords: true }, 'abc$ def$'],
        ['', { useOr: true }, ''],
        [' ', { useOr: true }, ' '],
        ['abc', { useOr: true }, 'abc'],
        [' abc ', { useOr: true }, 'abc'],
        ['abc def', { useOr: true }, 'abc|def'],
        ['  abc def  ', { useOr: true }, 'abc|def'],
        ['  abc def  ', { exactWords: true, useOr: true }, 'abc$|def$'],
    ]

    for (const [query, options, expectedResult] of values) {
        test(`query "${query}" with ${JSON.stringify(options)} options results to "${expectedResult}"`, () => {
            expect(normalizeQuery(query, options)).toEqual(expectedResult);
        });
    }
});