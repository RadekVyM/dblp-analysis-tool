'use server'

import { VenueType } from '@/shared/enums/VenueType'
import { BaseItemsParams, DBLP_CONF_INDEX_HTML, DBLP_JOURNALS_INDEX_HTML, DBLP_SERIES_INDEX_HTML, DBLP_URL } from '@/shared/fetching/fetching'
import { fetchItemsHtml } from '@/shared/fetching/items'

export async function fetchVenues(params: BaseItemsParams, type: VenueType) {
    const path = getPath(type);
    const html = await fetchItemsHtml(`${DBLP_URL}${path}`, params);
}

function getPath(type: VenueType) {
    switch (type) {
        case VenueType.Journal:
            return DBLP_JOURNALS_INDEX_HTML;
        case VenueType.Conference:
            return DBLP_CONF_INDEX_HTML;
        case VenueType.Series:
            return DBLP_SERIES_INDEX_HTML;
    }
}