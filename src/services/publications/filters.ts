import { DblpPublication } from '@/dtos/DblpPublication'

/**
 * Filters publications by specified filters.
 * @param publications List of publications
 * @param selectedTypes Map of selected publication types (publication type is the key)
 * @param selectedVenues Map of selected venues (venue ID is the key)
 * @param selectedYears Map of selected years (year is the key)
 * @param selectedAuthors Map of selected authors (author ID is the key)
 * @param useAndForSelectedAuthors Whether the filtered publications should contain all specified authors, or at least one
 * @returns Filtered publications
 */
export function filterPublications(
    publications: DblpPublication[],
    selectedTypes: Map<any, any>,
    selectedVenues?: Map<any, any>,
    selectedYears?: Map<any, any>,
    selectedAuthors?: Map<any, any>,
    useAndForSelectedAuthors?: boolean,
) {
    return publications.filter((publ) => (!selectedTypes || selectedTypes.size == 0 || selectedTypes.has(publ.type)) &&
        (!selectedVenues || selectedVenues.size == 0 || selectedVenues.has(publ.venueId) || (publ.seriesVenueId && publ.series && selectedVenues.has(publ.seriesVenueId))) &&
        (!selectedYears || selectedYears.size == 0 || selectedYears.has(publ.year)) &&
        (!selectedAuthors || selectedAuthors.size == 0 || filterByAuthors(publ, selectedAuthors, useAndForSelectedAuthors)));
}

/**
 * Filters publications by specified venues.
 * @param publications List of publications
 * @param selectedVenues Map of selected venues (venue ID is the key)
 * @returns Filtered publications
 */
export function getPublicationsByVenue(publications: Array<DblpPublication>, selectedVenues: Map<any, any>) {
    return selectedVenues.size === 0 ? publications : publications.filter((p) => selectedVenues.has(p.venueId) || (p.seriesVenueId && p.series && selectedVenues.has(p.seriesVenueId)));
}

/**
 * Filters publications by specified venues.
 * @param publications List of publications
 * @param selectedYears Map of selected years (year is the key)
 * @returns Filtered publications
 */
export function getPublicationsByYear(publications: Array<DblpPublication>, selectedYears: Map<any, any>) {
    return selectedYears.size === 0 ? publications : publications.filter((p) => selectedYears.has(p.year));
}

/**
 * Filters publications by specified venues.
 * @param publications List of publications
 * @param selectedTypes Map of selected publication types (publication type is the key)
 * @returns Filtered publications
 */
export function getPublicationsByType(publications: Array<DblpPublication>, selectedTypes: Map<any, any>) {
    return selectedTypes.size === 0 ? publications : publications.filter((p) => selectedTypes.has(p.type));
}

/**
 * Filters publications by specified venues.
 * @param publications List of publications
 * @param selectedAuthors Map of selected authors (author ID is the key)
 * @returns Filtered publications
 */
export function getPublicationsByAuthor(publications: Array<DblpPublication>, selectedAuthors: Map<any, any>) {
    return selectedAuthors.size === 0 ? publications : publications.filter((p) => [...p.authors, ...p.editors].some((a) => selectedAuthors.has(a.id)));
}

function filterByAuthors(publ: DblpPublication, selectedAuthors: Map<any, any>, useAndForSelectedAuthors?: boolean): boolean {
    const authorIds = [...publ.authors, ...publ.editors].map((a) => a.id);

    if (useAndForSelectedAuthors) {
        return [...selectedAuthors.keys()].every((selectedId) => authorIds.some((id) => id === selectedId));
    }
    return authorIds.some((id) => selectedAuthors.has(id));
}