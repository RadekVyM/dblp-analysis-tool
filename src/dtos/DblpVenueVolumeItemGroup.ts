import { DblpVenueVolumeItem } from './DblpVenueVolumeItem'

/** Group of items that represent volumes of a venue. */
export type DblpVenueVolumeItemGroup = {
    readonly title?: string,
    readonly items: Array<DblpVenueVolumeItem>,
}

/** Creates an object of a group of items that represent volumes of a venue. */
export function createDblpVenueVolumeItemGroup(
    items: Array<DblpVenueVolumeItem>,
    title?: string,
): DblpVenueVolumeItemGroup {
    return {
        title,
        items,
    }
}