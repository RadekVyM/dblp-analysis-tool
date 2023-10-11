import { clamp, repeat } from '@/utils/numbers'
import { describe, expect, test } from '@jest/globals'

describe('clamp function', () => {
    test('clamp 1 to the [1, 3] interval', () => {
        expect(clamp(1, 1, 3)).toBe(1);
    });
    test('clamp 1 to the [0, 3] interval', () => {
        expect(clamp(1, 0, 3)).toBe(1);
    });
    test('clamp 1 to the [2, 3] interval', () => {
        expect(clamp(1, 2, 3)).toBe(2);
    });
    test('clamp 1 to the [-2, 0] interval', () => {
        expect(clamp(1, -2, 0)).toBe(0);
    });
    test('clamp 1 to the [1, 1] interval', () => {
        expect(clamp(1, 1, 1)).toBe(1);
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