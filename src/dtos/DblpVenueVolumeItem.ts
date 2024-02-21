import { VenueType } from '@/enums/VenueType'

/** Item that represents a volume of a venue. */
export type DblpVenueVolumeItem = {
    readonly venueId: string,
    readonly volumeId: string,
    readonly title: string,
    readonly type?: VenueType,
}

/** Creates an object of an item that represents a volume of a venue. */
export function createDblpVenueVolumeItem(
    venueId: string,
    volumeId: string,
    title: string,
    type?: VenueType,
): DblpVenueVolumeItem {
    return {
        venueId,
        volumeId,
        title,
        type,
    }
}