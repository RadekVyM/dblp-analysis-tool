import { VenueType } from '@/shared/enums/VenueType'
import { BaseItemsParams } from '@/shared/fetching/shared'
import { fetchItemsIndexHtml } from '@/shared/fetching/items'
import { SimpleSearchResultItem } from '@/shared/models/SimpleSearchResult'
import * as cheerio from 'cheerio'
import { convertDblpUrlToLocalPath } from '@/shared/utils/urls'
import { SearchType } from '@/shared/enums/SearchType'
import { isNumber } from '@/shared/utils/strings'
import { DBLP_CONF_INDEX_HTML, DBLP_JOURNALS_INDEX_HTML, DBLP_SERIES_INDEX_HTML, DBLP_URL } from '@/shared/constants/urls'
import { DBLP_CONF_INDEX_ELEMENT_ID, DBLP_JOURNALS_INDEX_ELEMENT_ID, DBLP_SERIES_INDEX_ELEMENT_ID } from '../constants/html'

export async function fetchVenuesIndex(type: VenueType, params: BaseItemsParams) {
    const path = DBLP_HTML_INDEX_PATHS[type];
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${path}`, params);
    
    const $ = cheerio.load(html);
    const links = $(`#${DBLP_INDEX_ELEMENT_IDS[type]} ul li a`);

    let authors: Array<SimpleSearchResultItem> = [];

    links.each((index, element) => {
        const link = $(element);
        const title = link.text();
        const href = link.attr('href');

        authors.push({
            title: title,
            localUrl: href ? convertDblpUrlToLocalPath(href, SearchType.Venue) || '#' : '#'
        });
    });

    if (params.count) {
        authors = authors.slice(0, params.count);
    }

    return authors;
}

export async function fetchVenuesIndexLength(type: VenueType) {
    const path = DBLP_HTML_INDEX_PATHS[type];
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${path}`, { prefix: 'za' });

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

const DBLP_HTML_INDEX_PATHS = {
    [VenueType.Journal]: DBLP_JOURNALS_INDEX_HTML,
    [VenueType.Conference]: DBLP_CONF_INDEX_HTML,
    [VenueType.Series]: DBLP_SERIES_INDEX_HTML,
} as const

const DBLP_INDEX_ELEMENT_IDS = {
    [VenueType.Journal]: DBLP_JOURNALS_INDEX_ELEMENT_ID,
    [VenueType.Conference]: DBLP_CONF_INDEX_ELEMENT_ID,
    [VenueType.Series]: DBLP_SERIES_INDEX_ELEMENT_ID,
} as const
