import { group, repeat, anyItems, isGreater, isSmaller } from '@/utils/array'
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

describe('repeat function', () => {
    test('repeat 5 times and return indexes', () => {
        const count = 5;
        const result = repeat(count, (i) => i);

        for (let i = 0; i < count; i++) {
            expect(result).toContain(i);
        }
    });
    test('repeat 0 times and return indexes', () => {
        const count = 0;
        const result = repeat(count, (i) => i);

        expect(result).toEqual([]);
    });
    test('repeat once and return indexes', () => {
        const count = 1;
        const result = repeat(count, (i) => i);

        for (let i = 0; i < count; i++) {
            expect(result).toContain(i);
        }
    });

    const repeatString = 'repeat';

    test('repeat 5 times and return string', () => {
        const count = 5;
        const result = repeat(count, (i) => repeatString);

        const expected = [];

        for (let i = 0; i < count; i++) {
            expected.push(repeatString);
        }

        expect(result).toEqual(expected);
    });
    test('repeat 0 times and return indexes', () => {
        const count = 0;
        const result = repeat(count, (i) => i);

        expect(result).toEqual([]);
    });
    test('repeat once and return indexes', () => {
        const count = 1;
        const result = repeat(count, (i) => repeatString);

        expect(result).toEqual([repeatString]);
    });
});

describe('anyItems function', () => {
    test('there are no items', () => {
        const result = anyItems();
        expect(result).toBeFalsy();
    });
    test('there are some items', () => {
        const result = anyItems(1, 2, 3);
        expect(result).toBeTruthy();
    });
    test('there are some items from array', () => {
        const array = [1, 2, 3];
        const result = anyItems(...array);
        expect(result).toBeTruthy();
    });
});

describe('isGreater function', () => {
    const values: Array<[[any, any], number]> = [
        [['0', '456'], -1],
        [['0', '0'], 0],
        [['', ''], 0],
        [['abc', 'abc'], 0],
        [['abc', 'cba'], -1],
        [['cba', 'abc'], 1],
        [['1000', '0001'], 1],
    ];

    for (const [value, expectedValue] of values) {
        test(`returns whether "${value[0]}" is greater than "${value[1]}" => "${expectedValue}"`, () => {
            expect(isGreater(value[0], value[1])).toEqual(expectedValue);
        });
    }
});

describe('isSmaller function', () => {
    const values: Array<[[any, any], number]> = [
        [['0', '456'], 1],
        [['0', '0'], 0],
        [['', ''], 0],
        [['abc', 'abc'], 0],
        [['abc', 'cba'], 1],
        [['cba', 'abc'], -1],
        [['1000', '0001'], -1],
    ];

    for (const [value, expectedValue] of values) {
        test(`returns whether "${value[0]}" is greater than "${value[1]}" => "${expectedValue}"`, () => {
            expect(isSmaller(value[0], value[1])).toEqual(expectedValue);
        });
    }
});