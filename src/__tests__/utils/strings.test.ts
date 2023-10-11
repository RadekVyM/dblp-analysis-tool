import { isNullOrWhiteSpace, isNumber } from '@/utils/strings'
import { describe, expect, test } from '@jest/globals'

describe('isNullOrWhiteSpace function', () => {
    const truthyValues = [
        '',
        ' ',
        '  ',
        null,
        undefined
    ];
    const falsyValues = [
        'a',
        '  a  ',
    ];

    for (const value of truthyValues) {
        test(`is "${value}" null or white space`, () => {
            expect(isNullOrWhiteSpace(value)).toBeTruthy();
        });
    }

    for (const value of falsyValues) {
        test(`is "${value}" null or white space`, () => {
            expect(isNullOrWhiteSpace(value)).toBeFalsy();
        });
    }
});

describe('isNumber function', () => {
    const truthyValues = [
        '5',
        '0',
        '1000000000',
        '10000.000005',
        '0000.000005',
    ];
    const falsyValues = [
        'a',
        'e',
        '12a35',
        '12 35',
        '12 35 89',
    ];

    for (const value of truthyValues) {
        test(`is "${value}" a number`, () => {
            expect(isNumber(value)).toBeTruthy();
        });
    }

    for (const value of falsyValues) {
        test(`is "${value}" a number`, () => {
            expect(isNumber(value)).toBeFalsy();
        });
    }
});