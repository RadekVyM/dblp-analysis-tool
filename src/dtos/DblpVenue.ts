import { VenueType } from '@/enums/VenueType'
import { DblpVenueBase } from './DblpVenueBase'
import { VenueVolumeType } from '@/enums/VenueVolumeType'
import { DblpVenueVolumeItem } from './DblpVenueVolumeItem'

/** Venue stored in dblp. */
export type DblpVenue = {
    readonly volumes: Array<DblpVenueVolumeItem>
} & DblpVenueBase

/** Creates an object of a venue stored in dblp. */
export function createDblpVenue(
    id: string,
    title: string,
    volumes: Array<DblpVenueVolumeItem>,
    type?: VenueType,
): DblpVenue {
    return {
        id,
        title,
        type,
        volumes,
        venueVolumeType: VenueVolumeType.Venue
    }
}