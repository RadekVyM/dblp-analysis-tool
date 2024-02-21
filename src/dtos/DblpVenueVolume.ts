import { VenueType } from '@/enums/VenueType'
import { DblpPublication } from './DblpPublication'
import { DblpVenueBase } from './DblpVenueBase'
import { VenueVolumeType } from '@/enums/VenueVolumeType'

/** Venue volume stored in dblp. */
export type DblpVenuevolume = {
    readonly venueId: string,
    readonly publications: Array<DblpPublication>
} & DblpVenueBase

/** Creates an object of a venue volume stored in dblp. */
export function createDblpVenueVolume(
    id: string,
    venueId: string,
    title: string,
    publications: Array<DblpPublication>,
    type?: VenueType,
): DblpVenuevolume {
    return {
        id,
        venueId,
        title,
        publications,
        type,
        venueVolumeType: VenueVolumeType.Volume
    }
}