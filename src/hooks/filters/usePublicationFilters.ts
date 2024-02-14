import { useMemo } from 'react'
import useFilters from './useFilters'
import { FiltersConfiguration } from '@/dtos/Filters'
import { PUBLICATION_TYPE_TITLE } from '@/constants/client/publications'
import { PublicationFilterKey } from '@/enums/PublicationFilterKey'
import { DblpPublication } from '@/dtos/DblpPublication'
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
                        if (selectedTypes.has(publication.type) || selectedVenues.has(publication.venueId)) {
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

function getAllPublicationTypes(publications: Array<DblpPublication>) {
    const map = new Map<PublicationType, string>();

    for (const publication of publications) {
        map.set(publication.type, PUBLICATION_TYPE_TITLE[publication.type]);
    }

    return map;
}

function getAllPublicationVenues(publications: Array<DblpPublication>) {
    const map = new Map<string | undefined, string>();

    for (const publication of publications) {
        map.set(publication.venueId, getVenueTitle(publication));
    }

    return map;
}

function getVenueTitle(publication: DblpPublication): string {
    return publication.venueId ? publication.journal || publication.series || publication.booktitle || 'undefined' : 'Not Listed Publications'
}