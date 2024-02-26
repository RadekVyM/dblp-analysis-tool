import { useMemo } from 'react'
import useFilters from './useFilters'
import { FilterStatesMap, FiltersConfiguration } from '@/dtos/Filters'
import { PUBLICATION_TYPE_TITLE } from '@/constants/client/publications'
import { PublicationFilterKey } from '@/enums/PublicationFilterKey'
import { DblpPublication, getVenueTitle } from '@/dtos/DblpPublication'
import { PublicationType } from '@/enums/PublicationType'
import { getVenueTypeFromDblpString } from '@/utils/urls'
import { VenueType } from '@/enums/VenueType'

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
                    const { selectedVenues, selectedYears, selectedTypes } = getSelectedItems(state);

                    if (canReturnAllSelectable(state, PublicationFilterKey.Type)) {
                        return new Map(state[PublicationFilterKey.Type].allSelectableItems);
                    }

                    const map = new Map<any, any>();
                    const publicationsByYear = getPublicationsByYear(publications, selectedYears);
                    const publicationsByVenue = getPublicationsByVenue(publicationsByYear, selectedVenues);

                    for (const publication of publicationsByVenue) {
                        if (!map.has(publication.type)) {
                            map.set(publication.type, PUBLICATION_TYPE_TITLE[publication.type]);
                        }
                    }

                    for (const [type, title] of selectedTypes) {
                        map.set(type, title);
                    }

                    return map;
                }
            },
            [PublicationFilterKey.Venue]: {
                title: 'Venues',
                allSelectableItems: getAllPublicationVenues(publications),
                itemTitleSelector: (item) => item,
                updateSelectableItems: (state) => {
                    const { selectedVenues, selectedYears, selectedTypes } = getSelectedItems(state);

                    if (canReturnAllSelectable(state, PublicationFilterKey.Venue)) {
                        return new Map(state[PublicationFilterKey.Venue].allSelectableItems);
                    }

                    const map = new Map<any, any>();
                    const publicationsByYear = getPublicationsByYear(publications, selectedYears);
                    const publicationsByType = getPublicationsByType(publicationsByYear, selectedTypes);

                    for (const publication of publicationsByType) {
                        if (!map.has(publication.venueId)) {
                            const title = publication.venueId && getVenueTypeFromDblpString(publication.venueId) === VenueType.Book ?
                                'Book contents' :
                                getVenueTitle(publication);
                            map.set(publication.venueId, title);
                        }
                    }

                    // If I do not use "if (!map.has(venueId))", I do not get stable results.
                    // A venue can have different types of publications.
                    // Let's say we have a list of publications [a, b] with the types A and B.
                    // Both publications are from the same venue, but each publication has saved a bit different title of the venue.
                    // If a user selects type 'B', the venue title of the publication 'b' should be put to the selectableItems array.
                    // However, if I use only one cycle with the condition above, the venue title of the publication 'a' will be put to the array.
                    for (const [venueId, title] of selectedVenues) {
                        if (!map.has(venueId)) {
                            map.set(venueId, title);
                        }
                    }

                    return map;
                }
            },
            [PublicationFilterKey.Year]: {
                title: 'Years',
                allSelectableItems: getAllPublicationYears(publications),
                itemTitleSelector: (item) => item,
                updateSelectableItems: (state) => {
                    const { selectedVenues, selectedYears, selectedTypes } = getSelectedItems(state);

                    if (canReturnAllSelectable(state, PublicationFilterKey.Year)) {
                        return new Map(state[PublicationFilterKey.Year].allSelectableItems);
                    }

                    const map = new Map<any, any>();
                    const publicationsByType = getPublicationsByType(publications, selectedTypes);
                    const publicationsByVenue = getPublicationsByVenue(publicationsByType, selectedVenues);

                    for (const publication of publicationsByVenue) {
                        map.set(publication.year, publication.year.toString());
                    }

                    for (const [year, title] of selectedYears) {
                        map.set(year, title);
                    }

                    return map;
                }
            },
        }),
        [publications]);

    const state = useFilters(filters);
    const typesFilter = state.filtersMap[PublicationFilterKey.Type];
    const venuesFilter = state.filtersMap[PublicationFilterKey.Venue];
    const yearsFilter = state.filtersMap[PublicationFilterKey.Year];

    return { ...state, typesFilter, venuesFilter, yearsFilter };
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

/** Returns a map where the key is a year and the value is the year as string. */
function getAllPublicationYears(publications: Array<DblpPublication>): Map<number, string> {
    const map = new Map<number, string>();

    for (const publication of publications) {
        map.set(publication.year, publication.year.toString());
    }

    return map;
}

function getPublicationsByVenue(publications: Array<DblpPublication>, selectedVenues: Map<any, any>) {
    return selectedVenues.size === 0 ? publications : publications.filter((p) => selectedVenues.has(p.venueId));
}

function getPublicationsByYear(publications: Array<DblpPublication>, selectedYears: Map<any, any>) {
    return selectedYears.size === 0 ? publications : publications.filter((p) => selectedYears.has(p.year));
}

function getPublicationsByType(publications: Array<DblpPublication>, selectedTypes: Map<any, any>) {
    return selectedTypes.size === 0 ? publications : publications.filter((p) => selectedTypes.has(p.type));
}

function canReturnAllSelectable(state: FilterStatesMap, key: PublicationFilterKey) {
    return Object.keys(state).every((k) => k === key || state[k].selectedItems.size === 0);
}

function getSelectedItems(state: FilterStatesMap) {
    return {
        selectedTypes: state[PublicationFilterKey.Type].selectedItems,
        selectedVenues: state[PublicationFilterKey.Venue].selectedItems,
        selectedYears: state[PublicationFilterKey.Year].selectedItems
    };
}