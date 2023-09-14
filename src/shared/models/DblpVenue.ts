import { VenueType } from '../enums/VenueType'

export type DblpVenue = {
    readonly id: string,
    readonly title: string,
    readonly type?: VenueType,
}

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