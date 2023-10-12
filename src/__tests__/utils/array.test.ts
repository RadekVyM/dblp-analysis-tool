import { group } from '@/utils/array'
import { describe, expect, test } from '@jest/globals'

describe('group function', () => {
    test('group an array by even/odd', () => {
        const values = [0, 1, 2, 3, 4, 5];
        const result = group(values, (val) => (val % 2) === 0);

        expect(result.keys()).toContain(true);
        expect(result.keys()).toContain(false);
        expect(result.get(true)).toEqual([0, 2, 4]);
        expect(result.get(false)).toEqual([1, 3, 5]);
    });

    test('group an empty array by even/odd', () => {
        const values: Array<number> = [];
        const result = group(values, (val) => (val % 2) === 0);

        expect([...result.keys()]).toEqual([]);
        expect([...result.values()]).toEqual([]);
    });

    test('group an array by identity', () => {
        const values = [0, 1, 2, 3, 4, 5];
        const result = group(values, (val) => val);

        for (const value of values) {
            expect(result.keys()).toContain(value);
            expect(result.get(value)).toEqual([value]);
        }
    });
});