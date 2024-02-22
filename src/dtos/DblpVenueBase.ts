import { VenueType } from '@/enums/VenueType'
import { VenueVolumeType } from '@/enums/VenueVolumeType'
import { ExternalLink } from './ExternalLink'

/** Venue or venue volume stored in dblp. */
export type DblpVenueBase = {
    readonly id: string,
    readonly title: string,
    readonly venueVolumeType: VenueVolumeType,
    readonly type?: VenueType,
    readonly links: Array<ExternalLink>
}
