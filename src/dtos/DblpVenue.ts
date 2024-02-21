import { VenueType } from '@/enums/VenueType'
import { DblpVenueBase } from './DblpVenueBase'
import { VenueVolumeType } from '@/enums/VenueVolumeType'

/** Venue stored in dblp. */
export type DblpVenue = {
} & DblpVenueBase

/** Creates an object of a venue stored in dblp. */
export function createDblpVenue(
    id: string,
    title: string,
    type?: VenueType,
): DblpVenue {
    return {
        id,
        title,
        type,
        venueVolumeType: VenueVolumeType.Venue
    }
}