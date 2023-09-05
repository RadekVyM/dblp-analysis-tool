import { SimpleSearchResultItem } from '@/shared/models/SimpleSearchResult'
import { BaseItemsParams, handleErrors } from '@/shared/fetching/shared'
import { fetchItemsIndexHtml } from '@/shared/fetching/items'
import { isNumber } from '@/shared/utils/strings'
import * as cheerio from 'cheerio'
import { DBLP_AUTHORS_INDEX_HTML, DBLP_URL } from '@/shared/constants/urls'
import { DBLP_AUTHORS_INDEX_ELEMENT_ID } from '../constants/html'
import { convertDblpIdToNormalizedId, convertNormalizedIdToDblpPath } from '@/shared/utils/urls'
import { DblpAuthorHomonym, createDblpAuthor, createDblpAuthorInfo } from '@/shared/models/DblpAuthor'
import { extractPublicationsFromXml } from './publications'

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
            localUrl: `/search/author/${title.replaceAll(' ', '_')}`
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

export async function fetchAuthor(id: string) {
    const xml = await fetchAuthorXml(id);

    const $ = cheerio.load(xml, { xmlMode: true });

    const title = $('dblpperson').attr('name') || 'Not found';
    const person = $('dblpperson > person');
    const homonyms = extractPersonHomonyms($);

    const publications = extractPublicationsFromXml($);

    const author = createDblpAuthor(
        id,
        title,
        extractPersonInfo($, person, id, title),
        homonyms,
        publications
    );

    return author;
}

function extractPersonHomonyms($: cheerio.Root) {
    const homonyms = $('dblpperson > homonyms person').map((index, el) => {
        const elem = $(el);
        const homPid = elem.attr('key')?.replace('homepages/', '');
        const normalizedHomId = convertDblpIdToNormalizedId(`pid/${homPid}`);
        const authorInfo = extractPersonInfo($, elem, normalizedHomId, '');

        return {
            url: `/author/${normalizedHomId}`,
            info: authorInfo
        }
    }).get() as Array<DblpAuthorHomonym> || [];

    return homonyms;
}

function extractPersonInfo($: cheerio.Root, person: cheerio.Cheerio, id: string, title: string) {
    const date = person.attr('mdate');
    const personPubltype = person.attr('publtype');

    const aliases = person
        .children('author')
        .map((index, el) => {
            const pid = $(el).attr('pid');
            const title = $(el).text();

            return {
                title: title,
                id: convertDblpIdToNormalizedId(`pid/${pid}`)
            }
        })
        .get() as Array<{ title: string, id?: string }>;

    const links = person
        .children('url')
        .map((index, el) => $(el).text())
        .get() as Array<string>;

    person
        .children('note[type="uname"]')
        .each((index, el) => aliases.push({title: $(el).text(), id: undefined}));

    const affiliations = person
        .children('note[type="affiliation"]')
        .map((index, el) => $(el).text())
        .get() as Array<string>;

    const awards = person
        .children('note[type="award"]')
        .map((index, el) => {
            const elem = $(el);

            return {
                label: elem.attr('label'),
                title: elem.text()
            }
        })
        .get() as Array<{ label: string, title: string }>;

    return createDblpAuthorInfo(
        personPubltype == 'disambiguation',
        date || new Date().toString(),
        {
            aliases: aliases.filter((alias) => alias.title != title),
            links: [`${DBLP_URL}${convertNormalizedIdToDblpPath(id)}`, ...links],
            affiliations: affiliations,
            awards: awards
        }
    )
}

async function fetchAuthorXml(id: string) {
    const url = `${DBLP_URL}${convertNormalizedIdToDblpPath(id)}.xml`;

    const response = await fetch(url, { next: { revalidate: 3600 } });
    await handleErrors(response, 'application/xml');

    return response.text();
}