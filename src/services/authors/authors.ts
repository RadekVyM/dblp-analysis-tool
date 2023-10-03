import { fetchXml } from '@/services/fetching'
import { fetchItemsIndexHtml, queryItemsJson } from '@/services/items/items'
import { DBLP_AUTHORS_INDEX_HTML, DBLP_SEARCH_AUTHOR_API, DBLP_URL } from '@/constants/urls'
import { convertNormalizedIdToDblpPath } from '@/utils/urls'
import { RawDblpBaseSearchResult } from '@/models/DblpSearchResult'
import { BaseItemsParams, SearchAuthorsParams } from '@/models/searchItemsParams'
import { extractAuthor, extractAuthorsIndex, extractAuthorsIndexLength } from './parsing'

export async function queryAuthors(params: SearchAuthorsParams) {
    return queryItemsJson(`${DBLP_URL}${DBLP_SEARCH_AUTHOR_API}`, params).then(data => data as RawDblpBaseSearchResult);
}

export async function fetchAuthorsIndex(params: BaseItemsParams) {
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, params);
    return extractAuthorsIndex(html, params.count);
}

export async function fetchAuthorsIndexLength() {
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, { prefix: 'zzzzzzzzzzzzz' });
    return extractAuthorsIndexLength(html);
}

export async function fetchAuthor(id: string) {
    const xml = await fetchAuthorXml(id);
    return extractAuthor(xml, id);
}

async function fetchAuthorXml(id: string) {
    const url = `${DBLP_URL}${convertNormalizedIdToDblpPath(id)}.xml`;
    return fetchXml(url);
}