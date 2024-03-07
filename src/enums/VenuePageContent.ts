/** Type of content that is currently displayed on the venue page. */
export const VenuePageContent = {
    Publications: 'Publications',
    Volumes: 'Volumes',
} as const;

/** Type of content that is currently displayed on the venue page. */
export type VenuePageContent = keyof typeof VenuePageContent