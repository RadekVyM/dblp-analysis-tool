import { VenueType } from '@/enums/VenueType'
import { DblpVenueBase } from './DblpVenueBase'
import { VenueVolumeType } from '@/enums/VenueVolumeType'
import { convertToExternalLinks } from '@/utils/links'
import { DblpVenueVolumeItemGroup } from './DblpVenueVolumeItemGroup'

/** Venue stored in dblp. */
export type DblpVenue = {
    readonly volumeGroups: Array<DblpVenueVolumeItemGroup>
} & DblpVenueBase

/** Creates an object of a venue stored in dblp. */
export function createDblpVenue(
    id: string,
    title: string,
    volumeGroups: Array<DblpVenueVolumeItemGroup>,
    type?: VenueType,
    links?: Array<string>,
): DblpVenue {
    return {
        id,
        title,
        type,
        volumeGroups,
        venueVolumeType: VenueVolumeType.Venue,
        links: links ? convertToExternalLinks(links) : []
    }
}