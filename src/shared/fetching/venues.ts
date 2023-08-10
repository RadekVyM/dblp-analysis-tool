import { RawDblpBaseSearchResult } from "../dtos/DblpSearchResult";
import { DBLP_SEARCH_VENUE_API, DBLP_URL, ItemsParams } from "./fetching";
import { queryItemsJson } from "./items";

interface VenuesParams extends ItemsParams {
}

export async function queryVenues(params: VenuesParams) {
    return queryItemsJson(`${DBLP_URL}${DBLP_SEARCH_VENUE_API}`, params).then(data => data as RawDblpBaseSearchResult);
}