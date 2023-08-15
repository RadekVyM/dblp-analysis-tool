import { ItemsParams } from '@/shared/fetching/shared'
import { DblpSearchResult, DblpVenueSearchHit } from '@/shared/models/DblpSearchResult'
import { SearchType } from '@/shared/enums/SearchType'
import { SimpleSearchResult, SimpleSearchResultItem } from '@/shared/models/SimpleSearchResult'
import { queryVenues } from '@/shared/fetching/venues'
import { fetchVenuesIndex, fetchVenuesIndexLength } from '@/server/fetching/venues'
import { VenueType, getVenueTypeByKey } from '@/shared/enums/VenueType'
import { SearchParams } from '@/shared/models/SearchParams'
import SearchResultList from '../(components)/SearchResultList'
import { searchToItemsParams } from '@/shared/utils/searchParams'
import { DEFAULT_ITEMS_COUNT_PER_PAGE, MAX_QUERYABLE_ITEMS_COUNT } from '@/shared/constants/search'
import { isNumber } from '@/shared/utils/strings'

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
            paginationUrl='/search/venue' />
    )
}

async function getSearchResult(type: VenueType, params: ItemsParams) {
    if (params.query && params.query.length > 0) {
        return await getSearchResultWithQuery(type, params);
    }
    else {
        return await getSearchResultWithoutQuery(type, params);
    }
}

async function getSearchResultWithQuery(type: VenueType, params: ItemsParams) {
    const response = await queryVenues(params, type);
    const authors = new DblpSearchResult<DblpVenueSearchHit>(response, SearchType.Venue);
    const count = Math.min(authors.hits.total, MAX_QUERYABLE_ITEMS_COUNT);
    const result = new SimpleSearchResult(
        count,
        authors.hits.items.map((item) => {
            return {
                title: item.info.venue,
                localUrl: item.info.localUrl
            }
        }));

    return result;
}

async function getSearchResultWithoutQuery(type: VenueType, params: ItemsParams) {
    const promises = [
        fetchVenuesIndex(type, { first: params.first, count: DEFAULT_ITEMS_COUNT_PER_PAGE }),
        fetchVenuesIndexLength(type)
    ]

    const results = await Promise.allSettled(promises);
    const venues = results
        .filter((p): p is PromiseFulfilledResult<Array<SimpleSearchResultItem>> => p.status == 'fulfilled')
        .map((p) => p.value)
        .at(0);
    const count = results
        .filter((p): p is PromiseFulfilledResult<number> => p.status == 'fulfilled')
        .map((p) => p.value)
        .at(1);

    if ((!count && count != 0) || !venues) {
        throw new Error('Items could not be loaded');
    }

    const result = new SimpleSearchResult(count, venues);

    return result;
}