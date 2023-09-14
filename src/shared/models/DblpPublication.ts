import { PublicationType } from '../enums/PublicationType'

export type DblpPublication = {
    readonly id: string,
    readonly title: string,
    readonly year: number,
    readonly date: Date,
    readonly type: PublicationType,
    readonly ee?: string,
    readonly booktitle?: string,
    readonly pages?: string,
    readonly journal?: string,
    readonly volume?: string,
    readonly number?: string,
    readonly venueId?: string,
    readonly authors: Array<DblpPublicationPerson>,
    readonly editors: Array<DblpPublicationPerson>
}

export type DblpPublicationPerson = {
    id: string,
    url: string,
    name: string,
    orcid?: string
}

export function createDblpPublication(
    id: string,
    title: string,
    year: number,
    date: string,
    type: PublicationType,
    ee?: string,
    booktitle?: string,
    pages?: string,
    journal?: string,
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
        date: new Date(date),
        type,
        ee,
        booktitle,
        pages,
        journal,
        volume,
        number,
        venueId,
        authors: authors || [],
        editors: editors || []
    }
}