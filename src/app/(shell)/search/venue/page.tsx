import { VenueType, getVenueTypeByKey } from '@/enums/VenueType'
import { SearchParams } from '@/dtos/SearchParams'
import SearchResultList from '../(components)/SearchResultList'
import { searchToItemsParams } from '@/utils/searchParams'
import { DEFAULT_ITEMS_COUNT_PER_PAGE } from '@/constants/search'
import { SearchItemsParams } from '@/dtos/searchItemsParams'
import { fetchSearchResultWithQuery } from '@/services/venues/fetch'
import { SEARCH_VENUE } from '@/constants/urls'
import { fetchSearchResultWithoutQuery } from '@/services/venues/fetch-server'

type SearchVenuePageParams = {
    searchParams: SearchParams
}

export default async function SearchVenuePage({ searchParams }: SearchVenuePageParams) {
    const params = searchToItemsParams(searchParams, DEFAULT_ITEMS_COUNT_PER_PAGE);
    const venue = (searchParams.type ? getVenueTypeByKey(searchParams.type) : undefined) || VenueType.Journal;
    const result = await getSearchResult(venue, params);

    return (
        <SearchResultList
            result={result}
            searchParams={searchParams}
            paginationUrl={SEARCH_VENUE} />
    )
}

async function getSearchResult(type: VenueType, params: SearchItemsParams) {
    if (params.query && params.query.length > 0) {
        return await fetchSearchResultWithQuery(type, params);
    }
    else {
        return await fetchSearchResultWithoutQuery(type, params, DEFAULT_ITEMS_COUNT_PER_PAGE);
    }
}