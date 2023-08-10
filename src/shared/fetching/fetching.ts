export const DBLP_URL = 'https://dblp.org';
export const DBLP_SEARCH_AUTHOR_API = '/search/author/api';
export const DBLP_SEARCH_VENUE_API = '/search/venue/api';

export interface ItemsParams {
    query?: string,
    first?: number,
    count?: number,
    completionsCount?: number
}