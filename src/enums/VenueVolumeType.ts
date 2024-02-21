/**
 * Used to differentiate whether an object is a venue or venue volume.
 * 
 * Some venues are not divided into multiple volumes.
 * These venues are perceived by this app as if they are volumes.
 */
export const VenueVolumeType = {
    Venue: 'Venue',
    Volume: 'Volume',
} as const;

/** Used to differentiate whether an object is a venue or venue volume. */
export type VenueVolumeType = keyof typeof VenueVolumeType