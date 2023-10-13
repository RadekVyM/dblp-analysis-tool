import { VenueType } from '@/enums/VenueType'
import { dblpUrlContainsItemId, getVenueTypeFromString } from '@/utils/urls'
import { describe, expect, test } from '@jest/globals'

type UrlValue = [
    url: string, venue: VenueType | null
]

const urls: Array<UrlValue> = [
    ['https://dblp.org/pid/08/1510.xml', null],
    ['https://dblp.org/pid/08/1510.html', null],
    ['https://dblp.org/pid/08/1510', null],
    ['https://dblp.org/pid/l/BarbaraLiskov.xml', null],
    ['https://dblp.org/pid/l/BarbaraLiskov.html', null],
    ['https://dblp.org/pid/l/BarbaraLiskov', null],
    ['https://dblp.org/db/journals/sigspatial/index.xml', VenueType.Journal],
    ['https://dblp.org/db/journals/sigspatial/index.html', VenueType.Journal],
    ['https://dblp.org/db/journals/sigspatial/index', VenueType.Journal],
    ['https://dblp.org/db/journals/sigspatial/sigspatial13.xml', VenueType.Journal],
    ['https://dblp.org/db/journals/sigspatial/sigspatial13.html', VenueType.Journal],
    ['https://dblp.org/db/journals/sigspatial/sigspatial13', VenueType.Journal],
    ['https://dblp.org/db/journals/corr/corr1805.xml', VenueType.Journal],
    ['https://dblp.org/db/journals/corr/corr1805.html', VenueType.Journal],
    ['https://dblp.org/db/journals/corr/corr1805', VenueType.Journal],
    ['https://dblp.org/db/series/lncs/index.xml', VenueType.Series],
    ['https://dblp.org/db/series/lncs/index.html', VenueType.Series],
    ['https://dblp.org/db/series/lncs/index', VenueType.Series],
    ['https://dblp.org/db/conf/acal/index.xml', VenueType.Conference],
    ['https://dblp.org/db/conf/acal/index.html', VenueType.Conference],
    ['https://dblp.org/db/conf/acal/index', VenueType.Conference],
    ['https://dblp.org/db/conf/aiia/aic2013.xml', VenueType.Conference],
    ['https://dblp.org/db/conf/aiia/aic2013.html', VenueType.Conference],
    ['https://dblp.org/db/conf/aiia/aic2013', VenueType.Conference],
    ['https://dblp.org/db/conf/broadcom/broadcom2008.xml', VenueType.Conference],
    ['https://dblp.org/db/conf/broadcom/broadcom2008.html', VenueType.Conference],
    ['https://dblp.org/db/conf/broadcom/broadcom2008', VenueType.Conference],
]

describe('dblpUrlContainsItemId function', () => {
    const truthyValues = urls.map(u => u[0]);

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
    const values = [...urls];

    for (const [url, expectedVenueType] of values) {
        test(`"${url}" is of type ${expectedVenueType}`, () => {
            expect(getVenueTypeFromString(url)).toEqual(expectedVenueType);
        });
    }
});