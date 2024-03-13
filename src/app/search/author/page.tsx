import { AuthorSearchHit, getAuthorsNotes } from '@/dtos/search/SearchResult'
import { fetchSearchResultWithoutQuery } from '@/services/authors/fetch-server'
import { SearchParams } from '@/dtos/search/SearchParams'
import { searchToItemsParams } from '@/utils/searchParams'
import { DEFAULT_ITEMS_COUNT_PER_PAGE } from '@/constants/search'
import SearchResultList from '../(components)/SearchResultList'
import { SearchItemsParams } from '@/dtos/search/SearchItemsParams'
import { SEARCH_AUTHOR } from '@/constants/urls'
import he from 'he'
import { fetchSearchResultWithQuery } from '@/services/authors/fetch'

type SearchAuthorPageParams = {
    searchParams: SearchParams
}

/** Page displaying the author index or searched authors. */
export default async function SearchAuthorPage({ searchParams }: SearchAuthorPageParams) {
    const params = searchToItemsParams(searchParams, DEFAULT_ITEMS_COUNT_PER_PAGE);
    const result = await getSearchResult(params);

    return (
        <SearchResultList
            result={result}
            searchParams={searchParams}
            paginationUrl={SEARCH_AUTHOR} />
    )
}

async function getSearchResult(params: SearchItemsParams) {
    if (params.query && params.query.length > 0) {
        return await fetchSearchResultWithQuery(params, getAdditionalInfo);
    }
    else {
        return await fetchSearchResultWithoutQuery(params, DEFAULT_ITEMS_COUNT_PER_PAGE);
    }
}

function getAdditionalInfo(author: AuthorSearchHit) {
    const notes = getAuthorsNotes(author);

    return notes
        .map((n) => n['@type'] == 'award' ? undefined : he.decode(n.text))
        .filter((t) => t)
        .join('<br/>');
}