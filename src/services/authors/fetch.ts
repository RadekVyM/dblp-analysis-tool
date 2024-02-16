import { DBLP_SEARCH_AUTHOR_API, DBLP_URL } from '@/constants/urls'
import { fetchItemsJson } from '../items/fetch'
import { SearchAuthorsParams, SearchItemsParams } from '@/dtos/search/SearchItemsParams'
import { AuthorSearchHit, createSearchResultFromRaw } from '@/dtos/search/SearchResult'
import { SearchType } from '@/enums/SearchType'
import { MAX_QUERYABLE_ITEMS_COUNT } from '@/constants/search'
import { SimpleSearchResult, createSimpleSearchResult } from '@/dtos/search/SimpleSearchResult'
import { RawBaseSearchResult } from '@/dtos/search/RawSearchResult'

/**
 * Requests authors from a JSON dblp endpoint.
 * Used mainly for searching the database.
 * 
 * It is not possible to get more than first 10000 satisfactory results.
 * This is a limit set by dblp.
 * @param params Parameters which affect what items are returned
 * @returns Raw deserialized JSON object
 */
export async function fetchAuthors(params: SearchAuthorsParams): Promise<RawBaseSearchResult> {
    return fetchItemsJson(`${DBLP_URL}${DBLP_SEARCH_AUTHOR_API}`, params).then(data => data as RawBaseSearchResult);
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
    getAdditionalInfo: (author: AuthorSearchHit) => string
): Promise<SimpleSearchResult> {
    const response = await fetchAuthors(params);
    const authors = createSearchResultFromRaw<AuthorSearchHit>(response, SearchType.Author);
    const count = Math.min(authors.hits.total, MAX_QUERYABLE_ITEMS_COUNT);
    const result = createSimpleSearchResult(
        count,
        authors.hits.items.map((item) => ({
            title: item.info.author,
            localUrl: item.info.localUrl,
            additionalInfo: getAdditionalInfo(item.info)
        })));

    return result;
}