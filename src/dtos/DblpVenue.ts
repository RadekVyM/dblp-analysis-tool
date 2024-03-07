import { VenueType } from '@/enums/VenueType'
import { DblpVenueBase } from './DblpVenueBase'
import { VenueVolumeType } from '@/enums/VenueVolumeType'
import { convertToExternalLinks } from '@/utils/links'
import { DblpVenueVolumeItemGroup } from './DblpVenueVolumeItemGroup'
import { DblpVenueAuthorsInfo } from './DblpVenueInfo'
import { DblpVenuePublicationsInfo } from './DblpVenuePublicationsInfo'
import { ID_LOCAL_SEPARATOR } from '@/constants/urls'
import { DblpPublication } from './DblpPublication'

/** Venue stored in dblp. */
export type DblpVenue = {
    readonly volumeGroups: Array<DblpVenueVolumeItemGroup>,
    readonly publications?: Array<DblpPublication>,
    venueAuthorsInfo?: DblpVenueAuthorsInfo,
    venuePublicationsInfo?: DblpVenuePublicationsInfo,
} & DblpVenueBase

/** Creates an object of a venue stored in dblp. */
export function createDblpVenue(
    id: string,
    title: string,
    volumeGroups: Array<DblpVenueVolumeItemGroup>,
    type?: VenueType,
    links?: Array<string>,
    publications?: Array<DblpPublication>,
    venueAuthorsInfo?: DblpVenueAuthorsInfo,
    venuePublicationsInfo?: DblpVenuePublicationsInfo,
): DblpVenue {
    return {
        id,
        title,
        type,
        volumeGroups,
        venueVolumeType: VenueVolumeType.Venue,
        links: links ? convertToExternalLinks(links) : [],
        publications,
        venueAuthorsInfo,
        venuePublicationsInfo
    };
}

/**
 * Returns simplified title of a venue from its ID.
 * @param venueId ID of a venue
 * @returns ID of a venue in upper case
 */
export function getVenueTitleFromId(venueId: string) {
    return venueId
        .toLocaleUpperCase()
        .split(ID_LOCAL_SEPARATOR)
        .slice(1)
        .join(' ');
}