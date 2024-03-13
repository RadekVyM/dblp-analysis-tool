import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import { SavedAuthor } from '@/dtos/saves/SavedAuthor'
import { SavedItem } from '@/dtos/saves/SavedItem'
import { SavedVenue } from '@/dtos/saves/SavedVenue'

/**
 * Exports selected saved authors, venues and author groups to a JSON string.
 * @param savedAuthors List of saved authors
 * @param savedVenues List of saved venues
 * @param authorGroups List of saved author groups
 * @param selectedSavedAuthors Set of selected author IDs
 * @param selectedSavedVenues Set of selected venue IDs
 * @param selectedAuthorGroups Set of selected author group IDs
 * @returns JSON string
 */
export function exportSavedItemsToJson(
    savedAuthors: Array<SavedAuthor>,
    savedVenues: Array<SavedVenue>,
    authorGroups: Array<AuthorGroup>,
    selectedSavedAuthors: Set<string>,
    selectedSavedVenues: Set<string>,
    selectedAuthorGroups: Set<string>
) {
    const exportObject: any = {};

    const exportedSavedAuthors = savedAuthors.filter((a) => selectedSavedAuthors.has(a.id));
    const exportedSavedVenues = savedVenues.filter((a) => selectedSavedVenues.has(a.id));
    const exportedAuthorGroups = authorGroups.filter((a) => selectedAuthorGroups.has(a.id));

    if (exportedSavedAuthors.length > 0) {
        exportObject.savedAuthors = exportedSavedAuthors;
    }

    if (exportedSavedVenues.length > 0) {
        exportObject.savedVenues = exportedSavedVenues;
    }

    if (exportedAuthorGroups.length > 0) {
        exportObject.authorGroups = exportedAuthorGroups;
    }

    return JSON.stringify(exportObject);
}

/**
 * Extracts valid saved authors, venues and author groups from an object that is a result of JSON.parse().
 * @param jsonObj Object that is a result of JSON.parse()
 * @returns Saved authors, venues and author groups from the object
 */
export function retreiveValidSavedItems(jsonObj: any) {
    const savedAuthors = retreiveValidItems<SavedAuthor>(jsonObj['savedAuthors']);
    const savedVenues = retreiveValidItems<SavedVenue>(jsonObj['savedVenues'], (item) => 'venueId' in item);
    const authorGroups = retreiveValidItems<AuthorGroup>(jsonObj['authorGroups'], (item) => 'authors' in item);

    return {
        savedAuthors,
        savedVenues,
        authorGroups
    };
}

function retreiveValidItems<T extends SavedItem>(items: any, predicate?: (item: any) => boolean): Array<T> {
    if (items && Array.isArray(items)) {
        return items.filter((item) => 'id' in item && 'title' in item && (!predicate || predicate(item))) as Array<T>;
    }
    return [];
}