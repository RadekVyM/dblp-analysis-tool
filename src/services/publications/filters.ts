import { DblpPublication } from '@/dtos/DblpPublication'

/**
 * Filters publications by specified filters.
 * @param publications List of publications
 * @param selectedTypes Map of selected publication types (publication type is the key)
 * @param selectedVenues Map of selected venues (venue ID is the key)
 * @param selectedYears Map of selected years (year is the key)
 * @param selectedAuthors Map of selected authors (author ID is the key)
 * @returns Filtered publications
 */
export default function filterPublications(
    publications: DblpPublication[],
    selectedTypes: Map<any, any>,
    selectedVenues?: Map<any, any>,
    selectedYears?: Map<any, any>,
    selectedAuthors?: Map<any, any>,
) {
    return publications.filter((publ) => (!selectedTypes || selectedTypes.size == 0 || selectedTypes.has(publ.type)) &&
        (!selectedVenues || selectedVenues.size == 0 || selectedVenues.has(publ.venueId) || (publ.seriesVenueId && publ.series && selectedVenues.has(publ.seriesVenueId))) &&
        (!selectedYears || selectedYears.size == 0 || selectedYears.has(publ.year)) &&
        (!selectedAuthors || selectedAuthors.size == 0 || [...publ.authors, ...publ.editors].some((a) => selectedAuthors.has(a.id))));
}