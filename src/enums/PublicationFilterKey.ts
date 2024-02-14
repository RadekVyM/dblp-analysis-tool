export const PublicationFilterKey = {
    Type: 'Type',
    Venue: 'Venue',
} as const

export type PublicationFilterKey = keyof typeof PublicationFilterKey