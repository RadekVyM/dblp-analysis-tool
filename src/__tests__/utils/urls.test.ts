import { VenueType } from '@/enums/VenueType'
import { dblpUrlContainsItemId, getVenueTypeFromString, extractNormalizedIdFromDblpUrl, convertDblpIdToNormalizedId, convertNormalizedIdToDblpPath } from '@/utils/urls'
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
            expect(getVenueTypeFromString(url)).toEqual(expectedVenueType);
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