import { SimpleSearchResultItem } from '@/shared/dtos/SimpleSearchResult'
import { BaseItemsParams, DBLP_AUTHORS_INDEX_HTML, DBLP_URL } from '@/shared/fetching/fetching'
import { fetchItemsIndexHtml } from '@/shared/fetching/items'
import { isNumber } from '@/shared/utils/numbers'
import * as cheerio from 'cheerio'

export async function fetchAuthorsIndex(params: BaseItemsParams) {
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, params);

    const $ = cheerio.load(html);
    const links = $('#browse-person-output ul li a');

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
    const links = $('#browse-person-output ul li a');
    const prevLink = $('#browse-person-output p a[href^="?pos="]:not(.disabled)').first();
    const href = prevLink.attr('href');

    if (!href) {
        return 1;
    }

    const str = href.replace('?pos=', '');

    if (!isNumber(str)) {
        return 1;
    }

    const count = parseInt(str) + 300 + links.length;
    return count;
}