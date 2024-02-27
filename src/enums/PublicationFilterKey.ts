/** Key of a publication filter. */
export const PublicationFilterKey = {
    Type: 'Type',
    Venue: 'Venue',
    Year: 'Year',
    Author: 'Author',
} as const;

/** Key of a publication filter. */
export type PublicationFilterKey = keyof typeof PublicationFilterKey