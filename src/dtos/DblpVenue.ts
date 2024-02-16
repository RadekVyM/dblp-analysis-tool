import { VenueType } from '@/enums/VenueType'

/** Venue stored in dblp. */
export type DblpVenue = {
    readonly id: string,
    readonly title: string,
    readonly type?: VenueType,
}

/** Creates an object of a venue stored in dblp. */
export function createDblpVenue(
    id: string,
    title: string,
    type?: VenueType,
): DblpVenue {
    return {
        id,
        title,
        type
    }
}