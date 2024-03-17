import 'server-only'
import * as cheerio from 'cheerio'
import { DBLP_URL, SEARCH_AUTHOR } from '@/constants/urls'
import { convertDblpIdToNormalizedId, convertNormalizedIdToDblpPath } from '@/utils/urls'
import { DblpAuthorHomonym, createDblpAuthor, createDblpAuthorInfo } from '@/dtos/DblpAuthor'
import { DBLP_AUTHORS_INDEX_ELEMENT_ID } from '@/constants/html'
import { isNumber } from '@/utils/strings'
import { SimpleSearchResultItem } from '@/dtos/search/SimpleSearchResult'
import { extractPublicationsFromXml } from '../publications/parsing'
import he from 'he'
import { AUTHORS_COUNT_PER_DBLP_INDEX_PAGE } from '@/constants/search'

/**
 * Extracts all the author information from a XML string using Cheerio.
 * @param xml XML string
 * @param id Normalized ID of the author
 * @returns Object containing all the author information
 */
export function extractAuthor(xml: string, id: string) {
    const $ = cheerio.load(xml, { xmlMode: true });

    const title = $('dblpperson').attr('name') || 'Not found';
    const person = $('dblpperson > person');
    const homonyms = extractPersonHomonyms($);

    const publications = extractPublicationsFromXml($);

    return createDblpAuthor(
        id,
        he.decode(title),
        extractPersonInfo($, person, id, title),
        homonyms,
        publications
    );
}

/**
 * Extracts the authors index length from the last index HTML page.
 * @param html HTML string
 * @returns The authors index length
 */
export function extractAuthorsIndexLength(html: string) {
    const $ = cheerio.load(html);
    const links = $(`#${DBLP_AUTHORS_INDEX_ELEMENT_ID} ul li a`);
    const prevLink = $(`#${DBLP_AUTHORS_INDEX_ELEMENT_ID} p a[href^="?pos="]:not(.disabled)`).first();
    const href = prevLink.attr('href');

    if (!href) {
        return links.length;
    }

    const previousPageFirstItemPosition = href.replace('?pos=', '');

    if (!isNumber(previousPageFirstItemPosition)) {
        return links.length;
    }

    const count = parseInt(previousPageFirstItemPosition) - 1 + AUTHORS_COUNT_PER_DBLP_INDEX_PAGE + links.length;
    return count;
}

/**
 * Extracts all the items from a part of the authors index HTML page.
 * @param html HTML string
 * @param count Max number of returned items
 * @returns List of found authors
 */
export function extractAuthorsIndex(html: string, count?: number) {
    const $ = cheerio.load(html);
    const links = $(`#${DBLP_AUTHORS_INDEX_ELEMENT_ID} ul li a`);

    let authors: Array<SimpleSearchResultItem> = [];

    links.each((index, element) => {
        const link = $(element);
        const title = link.text();

        authors.push({
            title: he.decode(title),
            localUrl: `${SEARCH_AUTHOR}/${title.replaceAll(' ', '_')}`
        });
    });

    if (count) {
        authors = authors.slice(0, count);
    }

    return authors;
}

/** Extracts all the homonyms of a person from a Cheerio object. */
function extractPersonHomonyms($: cheerio.Root) {
    const homonyms: Array<DblpAuthorHomonym> = [];

    $('dblpperson > homonyms person').each((index, el) => {
        const elem = $(el);
        const homPid = elem.attr('key')?.replace('homepages/', '');
        const [normalizedHomId, _] = convertDblpIdToNormalizedId(`pid/${homPid}`) || ['', null];
        const authorInfo = extractPersonInfo($, elem, normalizedHomId, '');
        const url = `/author/${normalizedHomId}`;

        if (!homonyms.some((hom) => hom.url === url)) {
            homonyms.push({
                url: url,
                info: authorInfo
            });
        }
    });

    return homonyms;
}

/** Extracts all the person information from a Cheerio object. */
function extractPersonInfo($: cheerio.Root, person: cheerio.Cheerio, id: string, title: string) {
    const date = person.attr('mdate');
    const personPubltype = person.attr('publtype');

    const aliases = person
        .children('author')
        .map((index, el) => {
            const pid = $(el).attr('pid');
            const title = $(el).text();

            return {
                title: he.decode(title),
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
        .each((index, el) => aliases.push({ title: $(el).text(), id: undefined }));

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
        personPubltype === 'disambiguation',
        date || new Date().toString(),
        {
            aliases: aliases.filter((alias) => alias.title != title),
            links: [`${DBLP_URL}${convertNormalizedIdToDblpPath(id)}`, ...links],
            affiliations: affiliations,
            awards: awards
        }
    );
}