import { VENUE_TYPE_TITLE } from '@/constants/client/publications'
import { PublicationType } from '@/enums/PublicationType'
import { VenueType } from '@/enums/VenueType'
import { getVenueTypeFromDblpString } from '@/utils/urls'

/** Publication stored in dblp. */
export type DblpPublication = {
    readonly id: string,
    readonly title: string,
    readonly year: number,
    readonly month?: string,
    readonly date: Date,
    readonly type: PublicationType,
    readonly ee?: string,
    readonly booktitle?: string,
    readonly pages?: string,
    readonly journal?: string,
    readonly series?: string,
    readonly seriesVenueId?: string,
    readonly volume?: string,
    readonly number?: string,
    readonly venueId?: string,
    readonly volumeId?: string,
    readonly publisher?: string,
    readonly version?: string,
    readonly groupTitle: string | null,
    readonly groupIndex: number | null,
    readonly authors: Array<DblpPublicationPerson>,
    readonly editors: Array<DblpPublicationPerson>
}

/** Author or editor of a publication stored in dblp. */
export type DblpPublicationPerson = {
    id: string,
    url: string,
    name: string,
    orcid?: string
}

/** Creates an object of a publication stored in dblp. */
export function createDblpPublication(
    id: string,
    title: string,
    year: number,
    date: string,
    type: PublicationType,
    groupTitle: string | null,
    groupIndex: number | null,
    month?: string,
    ee?: string,
    booktitle?: string,
    pages?: string,
    journal?: string,
    series?: string,
    seriesVenueId?: string,
    volume?: string,
    number?: string,
    venueId?: string,
    volumeId?: string,
    publisher?: string,
    version?: string,
    authors?: Array<DblpPublicationPerson>,
    editors?: Array<DblpPublicationPerson>
): DblpPublication {
    return {
        id,
        title,
        year,
        month,
        date: new Date(date),
        type,
        ee,
        booktitle,
        pages,
        journal,
        series,
        seriesVenueId,
        volume,
        number,
        venueId,
        volumeId,
        publisher,
        version,
        groupTitle,
        groupIndex,
        authors: authors || [],
        editors: editors || []
    }
}

/**
 * Returns a title of a venue to which the publication belongs.
 * @param publication Publication
 * @returns Venue title
 */
export function getVenueTitle(publication: DblpPublication): string {
    if (publication.venueId) {
        const venueType = getVenueTypeFromDblpString(publication.venueId);

        // Books do not have a venue that is searchable
        if (venueType === VenueType.Book) {
            return 'Books';
        }

        const venueTypeTitle = venueType ? VENUE_TYPE_TITLE[venueType] : undefined;
        const title = publication.journal ||
            publication.booktitle ||
            publication.series ||
            (venueType === VenueType.Reference && publication.groupTitle) || // Some encyclopedias do not have a title, but are grouped by a venue
            'undefined';

        return venueTypeTitle ? `${title} (${venueTypeTitle})` : title;
    }

    return 'Unlisted Publications';
}