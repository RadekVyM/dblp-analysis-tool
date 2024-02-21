import { VENUE_TYPE_TITLE } from '@/constants/client/publications'
import { PublicationType } from '@/enums/PublicationType'
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
    readonly volume?: string,
    readonly number?: string,
    readonly venueId?: string,
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
    month?: string,
    ee?: string,
    booktitle?: string,
    pages?: string,
    journal?: string,
    series?: string,
    volume?: string,
    number?: string,
    venueId?: string,
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
        volume,
        number,
        venueId,
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
        const venueTitle = venueType ? VENUE_TYPE_TITLE[venueType] : undefined;
        const title = publication.journal || publication.booktitle || publication.series || 'undefined';
        return venueTitle ? `${title} (${venueTitle})` : title;
    }

    return 'Not Listed Publications';
}