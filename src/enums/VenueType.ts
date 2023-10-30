export function getVenueTypeByKey(stringKey: string) {
    const venueKey = Object
        .keys(VenueType)
        .find(key => key === stringKey);
    return venueKey ? venueKey as keyof typeof VenueType : null;
}

export const VenueType = {
    Journal: 'Journal',
    Conference: 'Conference',
    Series: 'Series',
} as const

export type VenueType = keyof typeof VenueType