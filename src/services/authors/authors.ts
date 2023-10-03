import { fetchXml } from '@/services/fetching'
import { fetchItemsIndexHtml, queryItemsJson } from '@/services/items/items'
import { DBLP_AUTHORS_INDEX_HTML, DBLP_SEARCH_AUTHOR_API, DBLP_URL } from '@/constants/urls'
import { convertNormalizedIdToDblpPath } from '@/utils/urls'
import { DblpAuthorSearchHit, DblpSearchResult, RawDblpBaseSearchResult } from '@/models/DblpSearchResult'
import { BaseSearchItemsParams, SearchAuthorsParams, SearchItemsParams } from '@/models/searchItemsParams'
import { extractAuthor, extractAuthorsIndex, extractAuthorsIndexLength } from './parsing'
import { SimpleSearchResult, SimpleSearchResultItem } from '@/models/SimpleSearchResult'
import { getFulfilledValueAt, getRejectedValueAt } from '@/utils/promises'
import { MAX_QUERYABLE_ITEMS_COUNT } from '@/constants/search'
import { SearchType } from '@/enums/SearchType'

export async function queryAuthors(params: SearchAuthorsParams) {
    return queryItemsJson(`${DBLP_URL}${DBLP_SEARCH_AUTHOR_API}`, params).then(data => data as RawDblpBaseSearchResult);
}

export async function fetchAuthorsIndex(params: BaseSearchItemsParams) {
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, params);
    return extractAuthorsIndex(html, params.count);
}

export async function fetchAuthorsIndexLength() {
    // With that prefix, I get to the last page of the index
    // There is a posibility that this will be a source of problems in the future
    // It is not a critical feature however
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${DBLP_AUTHORS_INDEX_HTML}`, { prefix: 'zzzzzzzzzzzzz' });
    return extractAuthorsIndexLength(html);
}

export async function fetchAuthor(id: string) {
    const xml = await fetchAuthorXml(id);
    return extractAuthor(xml, id);
}

export async function getSearchResultWithQuery(params: SearchItemsParams, getAdditionalInfo: (author: DblpAuthorSearchHit) => string) {
    const response = await queryAuthors(params);
    const authors = new DblpSearchResult<DblpAuthorSearchHit>(response, SearchType.Author);
    const count = Math.min(authors.hits.total, MAX_QUERYABLE_ITEMS_COUNT);
    const result = new SimpleSearchResult(
        count,
        authors.hits.items.map((item) => {
            return {
                title: item.info.author,
                localUrl: item.info.localUrl,
                additionalInfo: getAdditionalInfo(item.info)
            }
        }));

    return result;
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
        throw error?.cause as Error;
    }

    if (!count && count != 0) {
        const error = getRejectedValueAt<Error>(results, 1);
        throw error?.cause as Error;
    }

    const result = new SimpleSearchResult(count, authors);

    return result;
}

async function fetchAuthorXml(id: string) {
    const url = `${DBLP_URL}${convertNormalizedIdToDblpPath(id)}.xml`;
    return fetchXml(url);
}