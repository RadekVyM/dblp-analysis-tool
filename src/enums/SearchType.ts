/** Type of search that can performed. */
export const SearchType = {
    Author: 'Author',
    Venue: 'Venue',
} as const;

/** Type of search that can performed. */
export type SearchType = keyof typeof SearchType