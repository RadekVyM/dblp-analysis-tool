import { CONF_DBLP_KEY, JOURNALS_DBLP_KEY, SERIES_DBLP_KEY } from '../constants/search'

export enum VenueType {
    Journal = JOURNALS_DBLP_KEY, Conference = CONF_DBLP_KEY, Series = SERIES_DBLP_KEY
}

export function getVenueTypeByKey(stringKey: string) {
    const venueKey = Object
        .keys(VenueType)
        .find(key => VenueType[key as keyof typeof VenueType] == stringKey);
    return venueKey ? VenueType[venueKey as keyof typeof VenueType] : null;
}