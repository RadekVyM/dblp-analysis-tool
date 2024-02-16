/**
 * Returns a venue type by a specified string key or null if no such type exists.
 * @param stringKey
 * @returns Venue type or null
 */
export function getVenueTypeByKey(stringKey: string): VenueType | null {
    const venueKey = Object
        .keys(VenueType)
        .find(key => key === stringKey);
    return venueKey ? venueKey as keyof typeof VenueType : null;
}

/** Type of a venue in dblp. */
export const VenueType = {
    Journal: 'Journal',
    Conference: 'Conference',
    Series: 'Series',
} as const;

/** Type of a venue in dblp. */
export type VenueType = keyof typeof VenueType