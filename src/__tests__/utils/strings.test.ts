import { stify, isNullOrWhiteSpace, isNumber, removeAccents, extractOnlyNumbers, parseIntStrings, searchIncludes, prettifyXml } from '@/utils/strings'
import { describe, expect, test } from '@jest/globals'

describe('stify function', () => {
    const values: Array<[[string, number | undefined], string]> = [
        [['author', undefined], 'author'],
        [['author', 0], 'authors'],
        [['author', 1], 'author'],
        [['author', 2], 'authors'],
    ];

    for (const [value, expectedValue] of values) {
        test(`appends 's' to "${value[0]}" if ${value[1]} is not 1 => "${expectedValue}"`, () => {
            expect(stify(value[0], value[1])).toEqual(expectedValue);
        });
    }
});

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
        ' ',
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

describe('extractOnlyNumbers function', () => {
    const values = [
        ['Hello26', '26'],
        ['789', '789'],
        ['', ''],
        ['hello', ''],
        ['00hello7', '007'],
    ];

    for (const [value, expectedValue] of values) {
        test(`returs only numbers from "${value}" => "${expectedValue}"`, () => {
            expect(extractOnlyNumbers(value)).toEqual(expectedValue);
        });
    }
});

describe('removeAccents function', () => {
    const values = [
        ['Vymětalík', 'Vymetalik'],
        ['ěščřžýáíéůúťň', 'escrzyaieuutn'],
    ];

    for (const [value, expectedValue] of values) {
        test(`removes accents from "${value}" => "${expectedValue}"`, () => {
            expect(removeAccents(value)).toEqual(expectedValue);
        });
    }
});

describe('searchIncludes function', () => {
    const values: Array<[Array<string>, boolean]> = [
        [['hello', 'hello'], true],
        [['hello', 'h'], true],
        [['hello', 'h', 'hello'], true],
        [['hello', 'world'], false],
        [['Vymětalík', 'vymetalik'], true],
        [['Radek Vymětalík', 'radek', 'vymetalik'], true],
        [['ěščřžýáíéůúťň', 'escrzyaieuutn', 'yaieu'], true],
    ];

    for (const [value, expectedValue] of values) {
        test(`"${value[0]}" includes "${JSON.stringify(value.slice(1))}"`, () => {
            expect(searchIncludes(value[0], ...(value.slice(1)))).toEqual(expectedValue);
        });
    }
});

describe('parseIntStrings function', () => {
    const values: Array<[string | Array<string>, Array<number>]> = [
        [['0', 'hello', '456'], [0, 456]],
        ['hello', []],
        ['789', [789]],
        ['0001', [1]],
        [['0001'], [1]],
        [['hello', 'World'], []],
    ];

    for (const [value, expectedValue] of values) {
        test(`returns an array of integers in this string "${JSON.stringify(value)}" => "${expectedValue}"`, () => {
            expect(parseIntStrings(value)).toEqual(expectedValue);
        });
    }
});

describe('prettifyXml function', () => {
    const values: Array<[string, string]> = [
        ['<xml>hello</xml>', '<xml>hello</xml>'],
        ['<?xml version="1.0" encoding="UTF-8"?><xml>hello</xml>', '<?xml version="1.0" encoding="UTF-8"?>\n<xml>hello</xml>'],
        ['<xml><xml>hello</xml></xml>', '<xml>\n\t<xml>hello</xml>\n</xml>'],
        ['<xml><xml>hello</xml><xml>hello</xml></xml>', '<xml>\n\t<xml>hello</xml>\n\t<xml>hello</xml>\n</xml>'],
        ['<xml><xml>hello</xml><xml><xml>hello</xml></xml></xml>', '<xml>\n\t<xml>hello</xml>\n\t<xml>\n\t\t<xml>hello</xml>\n\t</xml>\n</xml>'],
    ];

    for (const [value, expectedValue] of values) {
        test(`prettifies this XML string "${value}" => "${expectedValue}"`, () => {
            expect(prettifyXml(value)).toEqual(expectedValue);
        });
    }
});