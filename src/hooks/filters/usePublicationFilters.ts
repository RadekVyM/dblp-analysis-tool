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
export default function usePublicationFilters(
    publications: Array<DblpPublication>,
    description?: {
        typeFilter?: string,
        venueFilter?: string,
        yearFilter?: string,
        authorFilter?: string,
    },
    defaultSelected?: {
        types?: Array<PublicationType>,
        /** Venue IDs */
        venues?: Array<string | undefined>,
        years?: Array<number>,
        /** Author IDs */
        authors?: Array<string>
    }
) {
    const filters = useMemo<FiltersConfiguration>(
        () => ({
            [PublicationFilterKey.Type]: {
                title: 'Publication Types',
                description: description?.typeFilter || 'Select only publications of certain type',
                allSelectableItems: getAllPublicationTypes(publications),
                defaultSelectedKeys: defaultSelected?.types,
                itemTitleSelector: (item) => item,
                updateSelectableItems: (state) => {
                    const { selectedVenues, selectedYears, selectedTypes, selectedAuthors } = getSelectedItems(state);

                    if (canReturnAllSelectable(state, PublicationFilterKey.Type)) {
                        return new Map(state[PublicationFilterKey.Type].allSelectableItems);
                    }

                    const map = new Map<any, any>();
                    const publicationsByYear = getPublicationsByYear(publications, selectedYears);
                    const publicationsByVenue = getPublicationsByVenue(publicationsByYear, selectedVenues);
                    const publicationsByAuthor = getPublicationsByAuthor(publicationsByVenue, selectedAuthors);

                    for (const publication of publicationsByAuthor) {
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
                description: description?.venueFilter || 'Select only publications from certain venues',
                allSelectableItems: getAllPublicationVenues(publications),
                defaultSelectedKeys: defaultSelected?.venues,
                itemTitleSelector: (item) => item,
                updateSelectableItems: (state) => {
                    const { selectedVenues, selectedYears, selectedTypes, selectedAuthors } = getSelectedItems(state);

                    if (canReturnAllSelectable(state, PublicationFilterKey.Venue)) {
                        return new Map(state[PublicationFilterKey.Venue].allSelectableItems);
                    }

                    const map = new Map<any, any>();
                    const publicationsByYear = getPublicationsByYear(publications, selectedYears);
                    const publicationsByType = getPublicationsByType(publicationsByYear, selectedTypes);
                    const publicationsByAuthor = getPublicationsByAuthor(publicationsByType, selectedAuthors);

                    for (const publication of publicationsByAuthor) {
                        if (!map.has(publication.venueId)) {
                            map.set(publication.venueId, getVenueTitle(publication));
                        }
                        if (publication.seriesVenueId && publication.series && !map.has(publication.seriesVenueId)) {
                            map.set(publication.seriesVenueId, publication.series);
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
                description: description?.yearFilter || 'Select only publications that were published in a certain year',
                allSelectableItems: getAllPublicationYears(publications),
                defaultSelectedKeys: defaultSelected?.years,
                itemTitleSelector: (item) => item,
                updateSelectableItems: (state) => {
                    const { selectedVenues, selectedYears, selectedTypes, selectedAuthors } = getSelectedItems(state);

                    if (canReturnAllSelectable(state, PublicationFilterKey.Year)) {
                        return new Map(state[PublicationFilterKey.Year].allSelectableItems);
                    }

                    const map = new Map<any, any>();
                    const publicationsByType = getPublicationsByType(publications, selectedTypes);
                    const publicationsByVenue = getPublicationsByVenue(publicationsByType, selectedVenues);
                    const publicationsByAuthor = getPublicationsByAuthor(publicationsByVenue, selectedAuthors);

                    for (const publication of publicationsByAuthor) {
                        map.set(publication.year, publication.year.toString());
                    }

                    for (const [year, title] of selectedYears) {
                        map.set(year, title);
                    }

                    return map;
                }
            },
            [PublicationFilterKey.Author]: {
                title: 'Authors',
                description: description?.authorFilter || 'Select only publications with specified authors',
                allSelectableItems: getAllPublicationAuthors(publications),
                defaultSelectedKeys: defaultSelected?.authors,
                itemTitleSelector: (item) => item,
                updateSelectableItems: (state) => {
                    const { selectedVenues, selectedYears, selectedTypes, selectedAuthors } = getSelectedItems(state);

                    if (canReturnAllSelectable(state, PublicationFilterKey.Author)) {
                        return new Map(state[PublicationFilterKey.Author].allSelectableItems);
                    }

                    const map = new Map<any, any>();
                    const publicationsByYear = getPublicationsByYear(publications, selectedYears);
                    const publicationsByType = getPublicationsByType(publicationsByYear, selectedTypes);
                    const publicationsByVenue = getPublicationsByVenue(publicationsByType, selectedVenues);

                    for (const publication of publicationsByVenue) {
                        for (const author of [...publication.authors, ...publication.editors]) {
                            map.set(author.id, author.name);
                        }
                    }

                    for (const [id, name] of selectedAuthors) {
                        map.set(id, name);
                    }

                    return map;
                }
            },
        }),
        [
            publications,
            description?.authorFilter,
            description?.typeFilter,
            description?.venueFilter,
            description?.yearFilter,
            defaultSelected?.authors,
            defaultSelected?.types,
            defaultSelected?.venues,
            defaultSelected?.years
        ]);

    const state = useFilters(filters);
    const typesFilter = state.filtersMap[PublicationFilterKey.Type];
    const venuesFilter = state.filtersMap[PublicationFilterKey.Venue];
    const yearsFilter = state.filtersMap[PublicationFilterKey.Year];
    const authorsFilter = state.filtersMap[PublicationFilterKey.Author];

    return { ...state, typesFilter, venuesFilter, yearsFilter, authorsFilter };
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
        if (publication.seriesVenueId && publication.series && !map.has(publication.seriesVenueId)) {
            map.set(publication.seriesVenueId, publication.series);
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

/** Returns a map where the key is an author ID and the value is the author's name. */
function getAllPublicationAuthors(publications: Array<DblpPublication>): Map<string, string> {
    const map = new Map<string, string>();

    for (const publication of publications) {
        for (const author of [...publication.authors, ...publication.editors]) {
            map.set(author.id, author.name);
        }
    }

    return map;
}

function getPublicationsByVenue(publications: Array<DblpPublication>, selectedVenues: Map<any, any>) {
    return selectedVenues.size === 0 ? publications : publications.filter((p) => selectedVenues.has(p.venueId) || (p.seriesVenueId && p.series && selectedVenues.has(p.seriesVenueId)));
}

function getPublicationsByYear(publications: Array<DblpPublication>, selectedYears: Map<any, any>) {
    return selectedYears.size === 0 ? publications : publications.filter((p) => selectedYears.has(p.year));
}

function getPublicationsByType(publications: Array<DblpPublication>, selectedTypes: Map<any, any>) {
    return selectedTypes.size === 0 ? publications : publications.filter((p) => selectedTypes.has(p.type));
}

function getPublicationsByAuthor(publications: Array<DblpPublication>, selectedAuthors: Map<any, any>) {
    return selectedAuthors.size === 0 ? publications : publications.filter((p) => [...p.authors, ...p.editors].some((a) => selectedAuthors.has(a.id)));
}

function canReturnAllSelectable(state: FilterStatesMap, key: PublicationFilterKey) {
    return Object.keys(state).every((k) => k === key || state[k].selectedItems.size === 0);
}

function getSelectedItems(state: FilterStatesMap) {
    return {
        selectedTypes: state[PublicationFilterKey.Type].selectedItems,
        selectedVenues: state[PublicationFilterKey.Venue].selectedItems,
        selectedYears: state[PublicationFilterKey.Year].selectedItems,
        selectedAuthors: state[PublicationFilterKey.Author].selectedItems,
    };
}