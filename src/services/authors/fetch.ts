import { DBLP_SEARCH_AUTHOR_API, DBLP_URL } from '@/constants/urls'
import { queryItemsJson } from '../items/items'
import { SearchAuthorsParams, SearchItemsParams } from '@/dtos/searchItemsParams'
import { DblpAuthorSearchHit, DblpSearchResult, RawDblpBaseSearchResult } from '@/dtos/DblpSearchResult'
import { SearchType } from '@/enums/SearchType'
import { MAX_QUERYABLE_ITEMS_COUNT } from '@/constants/search'
import { SimpleSearchResult } from '@/dtos/SimpleSearchResult'

export async function queryAuthors(params: SearchAuthorsParams) {
    return queryItemsJson(`${DBLP_URL}${DBLP_SEARCH_AUTHOR_API}`, params).then(data => data as RawDblpBaseSearchResult);
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