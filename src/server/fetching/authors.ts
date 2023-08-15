import { SimpleSearchResultItem } from '@/shared/dtos/SimpleSearchResult'
import { BaseItemsParams } from '@/shared/fetching/shared'
import { fetchItemsIndexHtml } from '@/shared/fetching/items'
import { isNumber } from '@/shared/utils/strings'
import * as cheerio from 'cheerio'
import { DBLP_AUTHORS_INDEX_HTML, DBLP_URL } from '@/shared/constants/urls'
import { DBLP_AUTHORS_INDEX_ELEMENT_ID } from '../constants/html'

export async function fetchAuthorsIndex(params: BaseItemsParams) {
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, params);

    const $ = cheerio.load(html);
    const links = $(`#${DBLP_AUTHORS_INDEX_ELEMENT_ID} ul li a`);

    let authors: Array<SimpleSearchResultItem> = [];

    links.each((index, element) => {
        const link = $(element);
        const title = link.text();

        authors.push({
            title: title,
            localUrl: `/search/author/${title}`
        });
    });

    if (params.count) {
        authors = authors.slice(0, params.count);
    }

    return authors;
}

export async function fetchAuthorsIndexLength() {
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, { prefix: 'zzzzzzzzzzzzz' });

    const $ = cheerio.load(html);
    const links = $(`#${DBLP_AUTHORS_INDEX_ELEMENT_ID} ul li a`);
    const prevLink = $(`#${DBLP_AUTHORS_INDEX_ELEMENT_ID} p a[href^="?pos="]:not(.disabled)`).first();
    const href = prevLink.attr('href');

    if (!href) {
        return links.length;
    }

    const str = href.replace('?pos=', '');

    if (!isNumber(str)) {
        return links.length;
    }

    const itemsCountPerDblpIndexPage = 300;
    const count = parseInt(str) - 1 + itemsCountPerDblpIndexPage + links.length;
    return count;
}