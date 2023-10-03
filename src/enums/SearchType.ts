export const SearchType = {
    Author: 'Author',
    Venue: 'Venue',
} as const

export type SearchType = keyof typeof SearchType