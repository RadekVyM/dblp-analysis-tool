import { RawDblpBaseSearchResult } from '../dtos/DblpSearchResult'
import { ItemsParams } from './shared'
import { queryItemsJson } from './items'
import { VenueType } from '../enums/VenueType'
import { DBLP_SEARCH_VENUE_API, DBLP_URL } from '../constants/urls'
import { CONF_DBLP_SEARCH_TYPE, JOURNALS_DBLP_SEARCH_TYPE, SERIES_DBLP_SEARCH_TYPE } from '../constants/search'

interface VenuesParams extends ItemsParams {
}

export async function queryVenues(params: VenuesParams, type?: VenueType) {
    const query = type ? `${getQueryPrefix(type)}${params.query || ''}` : params.query;
    return queryItemsJson(`${DBLP_URL}${DBLP_SEARCH_VENUE_API}`, {...params, query: query }).then(data => data as RawDblpBaseSearchResult);
}

function getQueryPrefix(type: VenueType) {
    let searchType = '';
    
    switch (type) {
        case VenueType.Journal:
            searchType = JOURNALS_DBLP_SEARCH_TYPE;
            break;
        case VenueType.Conference:
            searchType = CONF_DBLP_SEARCH_TYPE;
            break;
        case VenueType.Series:
            searchType = SERIES_DBLP_SEARCH_TYPE;
            break;
    }

    return `type:${searchType}:`;
}