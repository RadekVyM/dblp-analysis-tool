import { DblpAuthorSearchHit, DblpSearchResult, getAuthorsNotes } from '@/shared/dtos/DblpSearchResult'
import { SearchType } from '@/shared/enums/SearchType'
import { queryAuthors } from '@/shared/fetching/authors'
import { ItemsParams } from '@/shared/fetching/shared'
import { SimpleSearchResult } from '@/shared/dtos/SimpleSearchResult'
import { fetchAuthorsIndex, fetchAuthorsIndexLength } from '@/server/fetching/authors'
import { SearchParams } from '@/shared/dtos/SearchParams'
import SearchResultList from '../(components)/SearchResultList'
import { searchToItemsParams } from '@/shared/utils/searchParams'
import { DEFAULT_ITEMS_COUNT_PER_PAGE, MAX_QUERYABLE_ITEMS_COUNT } from '@/shared/constants/search'

type SearchAuthorPageParams = {
    searchParams: SearchParams
}

export default async function SearchAuthorPage({ searchParams }: SearchAuthorPageParams) {
    const params = searchToItemsParams(searchParams, DEFAULT_ITEMS_COUNT_PER_PAGE);
    const result = await getSearchResult(params);

    return (
        <SearchResultList
            result={result}
            searchParams={searchParams}
            paginationUrl='/search/author' />
    )
}

async function getSearchResult(params: ItemsParams) {
    if (params.query && params.query.length > 0) {
        return await getSearchResultWithQuery(params);
    }
    else {
        return await getSearchResultWithoutQuery(params);
    }
}

async function getSearchResultWithQuery(params: ItemsParams) {
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

async function getSearchResultWithoutQuery(params: ItemsParams) {
    // TODO: Use Promise.allSettled() - https://www.youtube.com/watch?v=f2Z1v3cqgDI
    const authors = await fetchAuthorsIndex({ first: params.first, count: DEFAULT_ITEMS_COUNT_PER_PAGE });
    const count = await fetchAuthorsIndexLength();
    const result = new SimpleSearchResult(count, authors);

    return result;
}

function getAdditionalInfo(author: DblpAuthorSearchHit) {
    const notes = getAuthorsNotes(author);

    return notes
        .map((n) => n['@type'] == 'award' ? undefined : n.text)
        .filter((t) => t)
        .join('<br/>');
}