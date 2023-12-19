import { VenueType } from '@/enums/VenueType'
import { SimpleSearchResultItem } from '@/dtos/SimpleSearchResult'
import * as cheerio from 'cheerio'
import { convertDblpUrlToLocalPath, getVenueTypeFromDblpString } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import { isNumber } from '@/utils/strings'
import { DBLP_CONF_INDEX_ELEMENT_ID, DBLP_JOURNALS_INDEX_ELEMENT_ID, DBLP_SERIES_INDEX_ELEMENT_ID } from '@/constants/html'
import { createDblpVenue } from '@/dtos/DblpVenue'
import he from 'he'

const DBLP_INDEX_ELEMENT_IDS = {
    [VenueType.Journal]: DBLP_JOURNALS_INDEX_ELEMENT_ID,
    [VenueType.Conference]: DBLP_CONF_INDEX_ELEMENT_ID,
    [VenueType.Series]: DBLP_SERIES_INDEX_ELEMENT_ID,
} as const

export function extractVenue(xml: string, id: string) {
    const $ = cheerio.load(xml, { xmlMode: true });

    const title = $('h1').text();
    const key = $('bht').attr('key');

    const venue = createDblpVenue(
        id,
        he.decode(title),
        key ? getVenueTypeFromDblpString(key) || undefined : undefined
    );

    return venue;
}

export function extractVenuesIndex(html: string, type: VenueType, count?: number) {
    const $ = cheerio.load(html);
    const links = $(`#${DBLP_INDEX_ELEMENT_IDS[type]} ul li a`);

    let authors: Array<SimpleSearchResultItem> = [];

    links.each((index, element) => {
        const link = $(element);
        const title = link.text();
        const href = link.attr('href');

        authors.push({
            title: he.decode(title),
            localUrl: href ? convertDblpUrlToLocalPath(href, SearchType.Venue) || '#' : '#'
        });
    });

    if (count) {
        authors = authors.slice(0, count);
    }

    return authors;
}

export function extractVenuesIndexLength(html: string, type: VenueType) {
    const id = DBLP_INDEX_ELEMENT_IDS[type];
    const $ = cheerio.load(html);
    const links = $(`#${id} ul li a`);
    const prevLink = $(`#${id} p a[href^="?pos="]:not(.disabled)`).first();
    const href = prevLink.attr('href');

    if (!href) {
        return links.length;
    }

    const str = href.replace('?pos=', '');

    if (!isNumber(str)) {
        return links.length;
    }

    const itemsCountPerDblpIndexPage = 100;
    const count = parseInt(str) - 1 + itemsCountPerDblpIndexPage + links.length;
    return count;
}