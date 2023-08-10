import { DBLP_SEARCH_VENUE_API, DBLP_URL, ItemsParams } from "./fetching";
import { fetchItems } from "./items";

interface VenuesParams extends ItemsParams {
}

export async function fetchVenues(params: VenuesParams) {
    return fetchItems(`${DBLP_URL}${DBLP_SEARCH_VENUE_API}`, params);
}