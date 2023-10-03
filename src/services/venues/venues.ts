import { VenueType } from '@/enums/VenueType'
import { fetchItemsIndexHtml } from '@/services/items/items'
import { convertNormalizedIdToDblpPath } from '@/utils/urls'
import { DBLP_CONF_INDEX_HTML, DBLP_JOURNALS_INDEX_HTML, DBLP_SEARCH_VENUE_API, DBLP_SERIES_INDEX_HTML, DBLP_URL } from '@/constants/urls'
import { extractVenue, extractVenuesIndex, extractVenuesIndexLength } from './parsing'
import { queryItemsJson } from '@/services/items/items'
import { fetchXml } from '@/services/fetching'
import { RawDblpBaseSearchResult } from '@/models/DblpSearchResult'
import { CONF_DBLP_SEARCH_TYPE, JOURNALS_DBLP_SEARCH_TYPE, SERIES_DBLP_SEARCH_TYPE } from '@/constants/search'
import { BaseItemsParams, SearchItemsParams } from '@/models/searchItemsParams'

const DBLP_HTML_INDEX_PATHS = {
    [VenueType.Journal]: DBLP_JOURNALS_INDEX_HTML,
    [VenueType.Conference]: DBLP_CONF_INDEX_HTML,
    [VenueType.Series]: DBLP_SERIES_INDEX_HTML,
} as const

interface VenuesParams extends SearchItemsParams {
}

export async function queryVenues(params: VenuesParams, type?: VenueType) {
    const query = type ? `${getQueryPrefix(type)}${params.query || ''}` : params.query;
    return queryItemsJson(`${DBLP_URL}${DBLP_SEARCH_VENUE_API}`, {...params, query: query }).then(data => data as RawDblpBaseSearchResult);
}

export async function fetchVenuesIndex(type: VenueType, params: BaseItemsParams) {
    const path = DBLP_HTML_INDEX_PATHS[type];
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${path}`, params);
    
    return extractVenuesIndex(html, type, params.count);
}

export async function fetchVenuesIndexLength(type: VenueType) {
    const path = DBLP_HTML_INDEX_PATHS[type];
    const html = await fetchItemsIndexHtml(`${DBLP_URL}${path}`, { prefix: 'za' });

    return extractVenuesIndexLength(html, type);
}

export async function fetchVenue(id: string) {
    const xml = await fetchVenueXml(id);
    return extractVenue(xml, id);
}

async function fetchVenueXml(id: string) {
    const url = `${DBLP_URL}/db${convertNormalizedIdToDblpPath(id)}/index.xml`;
    return fetchXml(url);
}

async function fetchVenueVolumeXml(id: string, volume: string) {
    const url = `${DBLP_URL}/db${convertNormalizedIdToDblpPath(id)}/${volume}.xml`;
    return fetchXml(url);
}

function getQueryPrefix(type: VenueType) {
    const searchType = {
        [VenueType.Journal]: JOURNALS_DBLP_SEARCH_TYPE,
        [VenueType.Conference]: CONF_DBLP_SEARCH_TYPE,
        [VenueType.Series]: SERIES_DBLP_SEARCH_TYPE,
    }[type];
    
    return `type:${searchType}:`;
}