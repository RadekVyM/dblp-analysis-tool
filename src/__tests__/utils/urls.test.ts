import { SearchType } from '@/enums/SearchType'
import { VenueType } from '@/enums/VenueType'
import { SearchParams } from '@/dtos/SearchParams'
import { dblpUrlContainsItemId, getVenueTypeFromDblpString, extractNormalizedIdFromDblpUrl, convertDblpIdToNormalizedId, convertNormalizedIdToDblpPath, createLocalSearchPath, createLocalPath, convertDblpUrlToLocalPath, extractParamsFromUrl } from '@/utils/urls'
import { describe, expect, test } from '@jest/globals'

type UrlValue = [
    url: string, venue: VenueType | null, normalizedId: [string, string | null]
]

type IdValue = [
    url: string, normalizedId: [string, string | null]
]

type NormalizedIdValue = [
    normalizedId: [string, string | null], url: string
]

type LocalSearchPathValue = [
    type: SearchType, params: SearchParams, path: string
]

type LocalPathValue = [
    type: SearchType, normalizedId: string, followingNormalizedId: string | undefined | null, path: string
]

type DblpUrlToLocalPathValue = [
    type: SearchType, dblpUrl: string, localPath: string
]

type ParamsFromUrlValue = [
    url: string, params: { [key: string]: any }
]

const validIdUrls: Array<UrlValue> = [
    ['https://dblp.org/pid/08/1510.xml', null, ['pid___08___1510', null]],
    ['https://dblp.org/pid/08/1510.html', null, ['pid___08___1510', null]],
    ['https://dblp.org/pid/08/1510', null, ['pid___08___1510', null]],
    ['https://dblp.org/pid/08/1510.html/', null, ['pid___08___1510', null]],
    ['https://dblp.org/pid/08/1510/', null, ['pid___08___1510', null]],
    ['https://dblp.org/pid/l/BarbaraLiskov.xml', null, ['pid___l___BarbaraLiskov', null]],
    ['https://dblp.org/pid/l/BarbaraLiskov.html', null, ['pid___l___BarbaraLiskov', null]],
    ['https://dblp.org/pid/l/BarbaraLiskov', null, ['pid___l___BarbaraLiskov', null]],
    ['https://dblp.org/db/journals/sigspatial/index.xml', VenueType.Journal, ['journals___sigspatial', null]],
    ['https://dblp.org/db/journals/sigspatial/index.html', VenueType.Journal, ['journals___sigspatial', null]],
    ['https://dblp.org/db/journals/sigspatial/index', VenueType.Journal, ['journals___sigspatial', null]],
    ['https://dblp.org/db/journals/sigspatial/sigspatial13.xml', VenueType.Journal, ['journals___sigspatial', 'sigspatial13']],
    ['https://dblp.org/db/journals/sigspatial/sigspatial13.html', VenueType.Journal, ['journals___sigspatial', 'sigspatial13']],
    ['https://dblp.org/db/journals/sigspatial/sigspatial13', VenueType.Journal, ['journals___sigspatial', 'sigspatial13']],
    ['https://dblp.org/db/journals/corr/corr1805.xml', VenueType.Journal, ['journals___corr', 'corr1805']],
    ['https://dblp.org/db/journals/corr/corr1805.html', VenueType.Journal, ['journals___corr', 'corr1805']],
    ['https://dblp.org/db/journals/corr/corr1805', VenueType.Journal, ['journals___corr', 'corr1805']],
    ['https://dblp.org/db/series/lncs/index.xml', VenueType.Series, ['series___lncs', null]],
    ['https://dblp.org/db/series/lncs/index.html', VenueType.Series, ['series___lncs', null]],
    ['https://dblp.org/db/series/lncs/index', VenueType.Series, ['series___lncs', null]],
    ['https://dblp.org/db/conf/acal/index.xml', VenueType.Conference, ['conf___acal', null]],
    ['https://dblp.org/db/conf/acal/index.html', VenueType.Conference, ['conf___acal', null]],
    ['https://dblp.org/db/conf/acal/index', VenueType.Conference, ['conf___acal', null]],
    ['https://dblp.org/db/conf/aiia/aic2013.xml', VenueType.Conference, ['conf___aiia', 'aic2013']],
    ['https://dblp.org/db/conf/aiia/aic2013.html', VenueType.Conference, ['conf___aiia', 'aic2013']],
    ['https://dblp.org/db/conf/aiia/aic2013', VenueType.Conference, ['conf___aiia', 'aic2013']],
    ['https://dblp.org/db/conf/broadcom/broadcom2008.xml', VenueType.Conference, ['conf___broadcom', 'broadcom2008']],
    ['https://dblp.org/db/conf/broadcom/broadcom2008.html', VenueType.Conference, ['conf___broadcom', 'broadcom2008']],
    ['https://dblp.org/db/conf/broadcom/broadcom2008', VenueType.Conference, ['conf___broadcom', 'broadcom2008']],
    ['https://dblp.org/db/conf/broadcom/broadcom2008/', VenueType.Conference, ['conf___broadcom', 'broadcom2008']],
];

const invalidIdUrls = [
    'https://dblp.org',
    'https://dblp.org/pid',
    'https://dblp.org/db',
    'https://dblp.org/db/series',
    'https://dblp.org/db/journals',
    'https://dblp.org/db/conf',
];

const validIds: Array<IdValue> = [
    ['/pid/08/1510.xml', ['pid___08___1510', null]],
    ['/pid/08/1510.html', ['pid___08___1510', null]],
    ['/pid/08/1510', ['pid___08___1510', null]],
    ['/pid/08/1510.html/', ['pid___08___1510', null]],
    ['/pid/08/1510/', ['pid___08___1510', null]],
    ['/pid/l/BarbaraLiskov.xml', ['pid___l___BarbaraLiskov', null]],
    ['/pid/l/BarbaraLiskov.html', ['pid___l___BarbaraLiskov', null]],
    ['/pid/l/BarbaraLiskov', ['pid___l___BarbaraLiskov', null]],
    ['/journals/sigspatial/index.xml', ['journals___sigspatial', null]],
    ['/journals/sigspatial/index.html', ['journals___sigspatial', null]],
    ['/journals/sigspatial/index', ['journals___sigspatial', null]],
    ['/journals/sigspatial', ['journals___sigspatial', null]],
    ['/journals/sigspatial/sigspatial13.xml', ['journals___sigspatial', 'sigspatial13']],
    ['/journals/sigspatial/sigspatial13.html', ['journals___sigspatial', 'sigspatial13']],
    ['/journals/sigspatial/sigspatial13', ['journals___sigspatial', 'sigspatial13']],
    ['/journals/corr/corr1805.xml', ['journals___corr', 'corr1805']],
    ['/journals/corr/corr1805.html', ['journals___corr', 'corr1805']],
    ['/journals/corr/corr1805', ['journals___corr', 'corr1805']],
    ['/series/lncs/index.xml', ['series___lncs', null]],
    ['/series/lncs/index.html', ['series___lncs', null]],
    ['/series/lncs/index', ['series___lncs', null]],
    ['/series/lncs', ['series___lncs', null]],
    ['/conf/acal/index.xml', ['conf___acal', null]],
    ['/conf/acal/index.html', ['conf___acal', null]],
    ['/conf/acal/index', ['conf___acal', null]],
    ['/conf/acal', ['conf___acal', null]],
    ['/conf/aiia/aic2013.xml', ['conf___aiia', 'aic2013']],
    ['/conf/aiia/aic2013.html', ['conf___aiia', 'aic2013']],
    ['/conf/aiia/aic2013', ['conf___aiia', 'aic2013']],
    ['/conf/broadcom/broadcom2008.xml', ['conf___broadcom', 'broadcom2008']],
    ['/conf/broadcom/broadcom2008.html', ['conf___broadcom', 'broadcom2008']],
    ['/conf/broadcom/broadcom2008', ['conf___broadcom', 'broadcom2008']],
    ['/conf/broadcom/broadcom2008/', ['conf___broadcom', 'broadcom2008']],
];

const normalizedIds: Array<NormalizedIdValue> = [
    [['pid___08___1510', null], '/pid/08/1510'],
    [['pid___l___BarbaraLiskov', null], '/pid/l/BarbaraLiskov'],
    [['journals___sigspatial', null], '/journals/sigspatial'],
    [['journals___sigspatial', 'sigspatial13'], '/journals/sigspatial/sigspatial13'],
    [['journals___corr', 'corr1805'], '/journals/corr/corr1805'],
    [['series___lncs', null], '/series/lncs']
];

describe('dblpUrlContainsItemId function', () => {
    const truthyValues = validIdUrls.map(u => u[0]);

    const falsyValues: Array<string> = [
        'https://dblp.org',
    ];

    for (const value of truthyValues) {
        test(`"${value}" contains an ID`, () => {
            expect(dblpUrlContainsItemId(value)).toBeTruthy();
        });
    }
    
    for (const value of falsyValues) {
        test(`"${value}" does not contain an ID`, () => {
            expect(dblpUrlContainsItemId(value)).toBeFalsy();
        });
    }
});

describe('getVenueTypeFromString function', () => {
    const values = [...validIdUrls];

    for (const [url, expectedVenueType] of values) {
        test(`"${url}" is of type ${expectedVenueType}`, () => {
            expect(getVenueTypeFromDblpString(url)).toEqual(expectedVenueType);
        });
    }
});

describe('extractNormalizedIdFromDblpUrl function', () => {
    const values = [...validIdUrls];

    for (const [url, _, normalizedId] of values) {
        test(`"${url}" contains these IDs ${JSON.stringify(normalizedId)}`, () => {
            expect(extractNormalizedIdFromDblpUrl(url)).toEqual(normalizedId);
        });
    }
    
    for (const url of [...invalidIdUrls]) {
        test(`"${url}" does not contain any ID`, () => {
            expect(extractNormalizedIdFromDblpUrl(url)).toBe(null);
        });
    }
});

describe('convertDblpIdToNormalizedId function', () => {
    const values = [...validIds];

    for (const [id, normalizedId] of values) {
        test(`"${id}" contains these IDs ${JSON.stringify(normalizedId)}`, () => {
            expect(convertDblpIdToNormalizedId(id)).toEqual(normalizedId);
        });
    }
});

describe('convertNormalizedIdToDblpPath function', () => {
    const values = [...normalizedIds];

    for (const [normalizedId, id] of values) {
        test(`${JSON.stringify(normalizedId)} should be converted to this path: "${id}"`, () => {
            expect(convertNormalizedIdToDblpPath(normalizedId[0], normalizedId[1])).toEqual(id);
        });
    }
});

describe('createLocalSearchPath function', () => {
    const values: Array<LocalSearchPathValue> = [
        [SearchType.Author, {}, '/search/author'],
        [SearchType.Venue, {}, '/search/venue'],
        [SearchType.Author, { query: undefined }, '/search/author'],
        [SearchType.Author, { query: null }, '/search/author?query'],
        [SearchType.Author, { query: '' }, '/search/author?query='],
        [SearchType.Author, { query: 'hello' }, '/search/author?query=hello'],
        [SearchType.Author, { query: 'hello', page: '2', type: 'hello' }, '/search/author?query=hello&page=2&type=hello'],
        [SearchType.Author, { page: '25f', type: 'hello' }, '/search/author?page=25f&type=hello'],
    ];

    for (const [type, params, path] of values) {
        test(`path of type ${type} with ${JSON.stringify(params)} should be: "${path}"`, () => {
            expect(createLocalSearchPath(type, params)).toBe(path);
        });
    }
});

describe('createLocalPath function', () => {
    const values: Array<LocalPathValue> = [
        [SearchType.Author, '', undefined, '/author/'],
        [SearchType.Author, 'hello', undefined, '/author/hello'],
        [SearchType.Author, 'hello', null, '/author/hello'],
        [SearchType.Author, 'hello', 'world', '/author/hello/world'],
        [SearchType.Venue, '', undefined, '/venue/'],
        [SearchType.Venue, 'hello', undefined, '/venue/hello'],
        [SearchType.Venue, 'hello', null, '/venue/hello'],
        [SearchType.Venue, 'hello', 'world', '/venue/hello/world'],
    ];

    for (const [type, normalizedId, followingNormalizedId, path] of values) {
        test(`path of type ${type} with "${normalizedId}" and "${followingNormalizedId} should be: "${path}"`, () => {
            expect(createLocalPath(normalizedId, type, followingNormalizedId)).toBe(path);
        });
    }
});

describe('convertDblpUrlToLocalPath function', () => {
    const values: Array<DblpUrlToLocalPathValue> = [
        [SearchType.Author, 'https://dblp.org/pid/08/1510.xml', '/author/pid___08___1510'],
        [SearchType.Author, 'https://dblp.org/pid/08/1510.html', '/author/pid___08___1510'],
        [SearchType.Author, 'https://dblp.org/pid/08/1510', '/author/pid___08___1510'],
        [SearchType.Author, 'https://dblp.org/pid/l/BarbaraLiskov.xml', '/author/pid___l___BarbaraLiskov'],
        [SearchType.Author, 'https://dblp.org/pid/l/BarbaraLiskov.html', '/author/pid___l___BarbaraLiskov'],
        [SearchType.Author, 'https://dblp.org/pid/l/BarbaraLiskov', '/author/pid___l___BarbaraLiskov'],
        [SearchType.Venue, 'https://dblp.org/db/conf/broadcom/broadcom2008.xml', '/venue/conf___broadcom/broadcom2008'],
        [SearchType.Venue, 'https://dblp.org/db/conf/broadcom/broadcom2008.html', '/venue/conf___broadcom/broadcom2008'],
        [SearchType.Venue, 'https://dblp.org/db/conf/broadcom/broadcom2008', '/venue/conf___broadcom/broadcom2008'],
        [SearchType.Venue, 'https://dblp.org/db/series/lncs/index.xml', '/venue/series___lncs'],
        [SearchType.Venue, 'https://dblp.org/db/series/lncs/index.html', '/venue/series___lncs'],
        [SearchType.Venue, 'https://dblp.org/db/series/lncs/index', '/venue/series___lncs'],
    ];

    for (const [type, dblpUrl, localPath] of values) {
        test(`"${dblpUrl}" should be converted to: "${localPath}"`, () => {
            expect(convertDblpUrlToLocalPath(dblpUrl, type)).toBe(localPath);
        });
    }
});

describe('extractParamsFromUrl function', () => {
    const values: Array<ParamsFromUrlValue> = [
        ['https://dblp.org/pid/08/1510.xml', {}],
        ['https://dblp.org', {}],
        ['https://dblp.org?', {}],
        ['?', {}],
        ['https://dblp.org?hello=0', { hello: '0' }],
        ['https://dblp.org?hello=0&world=!', { hello: '0', world: '!' }],
        ['https://dblp.org?hello=0&world', { hello: '0', world: undefined }],
        ['?hello=0&world', { hello: '0', world: undefined }],
        ['/author?hello=0&world', { hello: '0', world: undefined }],
    ];

    for (const [url, params] of values) {
        test(`this "${url}" contains these parameters: "${JSON.stringify(params)}"`, () => {
            expect(extractParamsFromUrl(url)).toEqual(params);
        });
    }
});