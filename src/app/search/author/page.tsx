import { DblpAuthorSearchHit, DblpSearchResult, getAuthorsNotes } from '@/shared/models/DblpSearchResult'
import { SearchType } from '@/shared/enums/SearchType'
import { queryAuthors } from '@/shared/fetching/authors'
import { ItemsParams } from '@/shared/fetching/shared'
import { SimpleSearchResult, SimpleSearchResultItem } from '@/shared/models/SimpleSearchResult'
import { fetchAuthorsIndex, fetchAuthorsIndexLength } from '@/server/fetching/authors'
import { SearchParams } from '@/shared/models/SearchParams'
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
    const promises = [
        fetchAuthorsIndex({ first: params.first, count: DEFAULT_ITEMS_COUNT_PER_PAGE }),
        fetchAuthorsIndexLength()
    ]

    const results = await Promise.allSettled(promises);
    const authors = results
        .filter((p): p is PromiseFulfilledResult<Array<SimpleSearchResultItem>> => p.status == 'fulfilled')
        .map((p) => p.value)
        .at(0);
    const count = results
        .filter((p): p is PromiseFulfilledResult<number> => p.status == 'fulfilled')
        .map((p) => p.value)
        .at(1);

    if ((!count && count != 0) || !authors) {
        throw new Error('Items could not be loaded');
    }

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