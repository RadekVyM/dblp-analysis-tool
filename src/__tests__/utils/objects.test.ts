import { anyKeys } from '@/utils/objects'
import { describe, expect, test } from '@jest/globals'

describe('anyKeys function', () => {
    const truthyValues = [
        { hello: 'world' },
        { hello: 'world', world: 'hello' },
        { hello: null },
        { hello: undefined }
    ];
    const falsyValues = [
        {}
    ];

    for (const value of truthyValues) {
        test(`is "${value}" a number`, () => {
            expect(anyKeys(value)).toBeTruthy();
        });
    }

    for (const value of falsyValues) {
        test(`is "${value}" a number`, () => {
            expect(anyKeys(value)).toBeFalsy();
        });
    }
});