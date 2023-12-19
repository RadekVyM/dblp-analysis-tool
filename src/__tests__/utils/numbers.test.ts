import { clamp } from '@/utils/numbers'
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