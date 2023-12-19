'use server'

import 'server-only'
import { fetchXml, withCache } from '@/services/fetch'
import { fetchItemsIndexHtml } from '@/services/items/items'
import { DBLP_AUTHORS_INDEX_HTML, DBLP_URL } from '@/constants/urls'
import { convertNormalizedIdToDblpPath } from '@/utils/urls'
import { BaseSearchItemsParams, SearchItemsParams } from '@/dtos/searchItemsParams'
import { extractAuthor, extractAuthorsIndex, extractAuthorsIndexLength } from './parsing'
import { SimpleSearchResult, SimpleSearchResultItem } from '@/dtos/SimpleSearchResult'
import { getFulfilledValueAt, getRejectedValueAt } from '@/utils/promises'
import { cacheAuthor, tryGetCachedAuthor } from '../cache/authors'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { serverError } from '@/utils/errors'

export async function fetchAuthorsIndex(params: BaseSearchItemsParams) {
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, params);
    return extractAuthorsIndex(html, params.count)
}

export async function fetchAuthorsIndexLength() {
    // With that prefix, I get to the last page of the index
    // There is a posibility that this will be a source of problems in the future
    // It is not a critical feature however
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, { prefix: 'zzzzzzzzzzzzz' });
    return extractAuthorsIndexLength(html)
}

export async function fetchAuthor(id: string) {
    return await withCache<DblpAuthor>(
        async (value: DblpAuthor) => await cacheAuthor(id, value),
        async () => await tryGetCachedAuthor(id),
        async () => {
            const xml = await fetchAuthorXml(id);
            return extractAuthor(xml, id)
        }
    )
}

export async function getSearchResultWithoutQuery(params: SearchItemsParams, itemsCount: number) {
    const promises = [
        fetchAuthorsIndex({ first: params.first, count: itemsCount }),
        fetchAuthorsIndexLength()
    ];

    const results = await Promise.allSettled(promises);
    const authors = getFulfilledValueAt<Array<SimpleSearchResultItem>>(results, 0);
    const count = getFulfilledValueAt<number>(results, 1);

    if (!authors) {
        const error = getRejectedValueAt<Error>(results, 0);
        console.error(error);
        throw serverError('Authors could not be fetched.');
    }

    if (!count && count != 0) {
        const error = getRejectedValueAt<Error>(results, 1);
        console.error(error);
        throw serverError('Authors count could not be fetched.');
    }

    const result = new SimpleSearchResult(count, authors);

    return result
}

async function fetchAuthorXml(id: string) {
    const url = `${DBLP_URL}${convertNormalizedIdToDblpPath(id)}.xml`;
    return fetchXml(url)
}