import { DBLP_SEARCH_AUTHOR_API, DBLP_URL } from '@/constants/urls'
import { fetchItemsJson } from '../items/fetch'
import { SearchAuthorsParams, SearchItemsParams } from '@/dtos/searchItemsParams'
import { DblpAuthorSearchHit, DblpSearchResult, RawDblpBaseSearchResult } from '@/dtos/DblpSearchResult'
import { SearchType } from '@/enums/SearchType'
import { MAX_QUERYABLE_ITEMS_COUNT } from '@/constants/search'
import { SimpleSearchResult } from '@/dtos/SimpleSearchResult'

/**
 * Requests authors from a JSON dblp endpoint.
 * Used mainly for searching the database.
 * 
 * It is not possible to get more than first 10000 satisfactory results.
 * This is a limit set by dblp.
 * @param params Parameters which affect what items are returned
 * @returns Raw deserialized JSON object
 */
export async function fetchAuthors(params: SearchAuthorsParams): Promise<RawDblpBaseSearchResult> {
    return fetchItemsJson(`${DBLP_URL}${DBLP_SEARCH_AUTHOR_API}`, params).then(data => data as RawDblpBaseSearchResult);
}

/**
 * Requests authors from a JSON dblp endpoint.
 * Used mainly for searching the database by the name of an author.
 * 
 * @param params Parameters which affect what items are returned
 * @param getAdditionalInfo Specifies some additional info
 * @returns Processed search result containg a list of found authors
 */
export async function fetchSearchResultWithQuery(
    params: SearchItemsParams,
    getAdditionalInfo: (author: DblpAuthorSearchHit) => string
): Promise<SimpleSearchResult> {
    const response = await fetchAuthors(params);
    const authors = new DblpSearchResult<DblpAuthorSearchHit>(response, SearchType.Author);
    const count = Math.min(authors.hits.total, MAX_QUERYABLE_ITEMS_COUNT);
    const result = new SimpleSearchResult(
        count,
        authors.hits.items.map((item) => ({
            title: item.info.author,
            localUrl: item.info.localUrl,
            additionalInfo: getAdditionalInfo(item.info)
        })));

    return result;
}