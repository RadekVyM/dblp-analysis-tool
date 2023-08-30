import { RawDblpBaseSearchResult } from '../models/DblpSearchResult'
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
    const searchType = {
        [VenueType.Journal]: JOURNALS_DBLP_SEARCH_TYPE,
        [VenueType.Conference]: CONF_DBLP_SEARCH_TYPE,
        [VenueType.Series]: SERIES_DBLP_SEARCH_TYPE,
    }[type];
    
    return `type:${searchType}:`;
}