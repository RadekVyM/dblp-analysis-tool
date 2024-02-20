import { useMemo } from 'react'
import useFilters from './useFilters'
import { FiltersConfiguration } from '@/dtos/Filters'
import { PUBLICATION_TYPE_TITLE } from '@/constants/client/publications'
import { PublicationFilterKey } from '@/enums/PublicationFilterKey'
import { DblpPublication, getVenueTitle } from '@/dtos/DblpPublication'
import { PublicationType } from '@/enums/PublicationType'

/**
 * Hook that creates and initializes a data structure for managing publication filters.
 * @param publications List of publications
 * @returns Data structure for managing publication filters and related operations
 */
export default function usePublicationFilters(publications: Array<DblpPublication>) {
    const filters = useMemo<FiltersConfiguration>(
        () => ({
            [PublicationFilterKey.Type]: {
                title: 'Publication Types',
                allSelectableItems: getAllPublicationTypes(publications),
                itemTitleSelector: (item) => item,
                updateSelectableItems: (state) => {
                    if (state[PublicationFilterKey.Venue].selectedItems.size === 0) {
                        return new Map(state[PublicationFilterKey.Type].allSelectableItems);
                    }

                    const selectedTypes = state[PublicationFilterKey.Type].selectedItems;
                    const selectedVenues = state[PublicationFilterKey.Venue].selectedItems;
                    const map = new Map<any, any>();

                    for (const publication of publications) {
                        if (selectedVenues.has(publication.venueId) || selectedTypes.has(publication.type)) {
                            if (!map.has(publication.type))
                                map.set(publication.type, PUBLICATION_TYPE_TITLE[publication.type]);
                        }
                    }

                    return map;
                }
            },
            [PublicationFilterKey.Venue]: {
                title: 'Venues',
                allSelectableItems: getAllPublicationVenues(publications),
                itemTitleSelector: (item) => item,
                updateSelectableItems: (state) => {
                    if (state[PublicationFilterKey.Type].selectedItems.size === 0) {
                        return new Map(state[PublicationFilterKey.Venue].allSelectableItems);
                    }

                    const selectedTypes = state[PublicationFilterKey.Type].selectedItems;
                    const selectedVenues = state[PublicationFilterKey.Venue].selectedItems;
                    const map = new Map<any, any>();

                    for (const publication of publications) {
                        if (selectedTypes.has(publication.type)) {
                            map.set(publication.venueId, getVenueTitle(publication));
                        }
                    }

                    // If I use something like this: (selectedTypes.has(publication.type) || selectedVenues.has(publication.venueId))
                    // in the first cycle, I do not get stable results.
                    // A venue can have different types of publications.
                    // Let's say we have a list of publications [a, b] with the types A and B.
                    // Both publications are from the same venue, but each publication has saved a bit different title of the venue.
                    // If a user selects type 'B', the venue title of the publication 'b' should be put to the selectableItems array.
                    // However, if I use only one cycle with the condition above, the venue title of the publication 'a' will be put to the array.
                    for (const publication of publications) {
                        if (selectedVenues.has(publication.venueId) && !map.has(publication.venueId)) {
                            map.set(publication.venueId, getVenueTitle(publication));
                        }
                    }

                    return map;
                }
            },
        }),
        [publications]);

    const state = useFilters(filters);
    const typesFilter = state.filtersMap[PublicationFilterKey.Type];
    const venuesFilter = state.filtersMap[PublicationFilterKey.Venue];

    return { ...state, typesFilter, venuesFilter };
}

/** Returns a map where the key is a value of PublicationType and the value is a value of PUBLICATION_TYPE_TITLE. */
function getAllPublicationTypes(publications: Array<DblpPublication>): Map<PublicationType, string> {
    const map = new Map<PublicationType, string>();

    for (const publication of publications) {
        map.set(publication.type, PUBLICATION_TYPE_TITLE[publication.type]);
    }

    return map;
}

/** Returns a map where the key is a venue ID and the value is a venue title. */
function getAllPublicationVenues(publications: Array<DblpPublication>): Map<string | undefined, string> {
    const map = new Map<string | undefined, string>();

    for (const publication of publications) {
        if (!map.has(publication.venueId)) {
            map.set(publication.venueId, getVenueTitle(publication));
        }
    }

    return map;
}