import { DblpAuthorSearchHit, getAuthorsNotes } from '@/models/DblpSearchResult'
import { getSearchResultWithQuery, getSearchResultWithoutQuery } from '@/services/authors/authors'
import { SearchParams } from '@/models/SearchParams'
import { searchToItemsParams } from '@/utils/searchParams'
import { DEFAULT_ITEMS_COUNT_PER_PAGE } from '@/constants/search'
import SearchResultList from '../(components)/SearchResultList'
import { SearchItemsParams } from '@/models/searchItemsParams'
import { SEARCH_AUTHOR } from '@/constants/urls'

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
            paginationUrl={SEARCH_AUTHOR} />
    )
}

async function getSearchResult(params: SearchItemsParams) {
    if (params.query && params.query.length > 0) {
        return await getSearchResultWithQuery(params, getAdditionalInfo);
    }
    else {
        return await getSearchResultWithoutQuery(params, DEFAULT_ITEMS_COUNT_PER_PAGE);
    }
}

function getAdditionalInfo(author: DblpAuthorSearchHit) {
    const notes = getAuthorsNotes(author);

    return notes
        .map((n) => n['@type'] == 'award' ? undefined : n.text)
        .filter((t) => t)
        .join('<br/>');
}