import { VenueType } from '@/enums/VenueType'
import { BOOKS_DBLP_KEY, CONF_DBLP_KEY, JOURNALS_DBLP_KEY, REFERENCE_DBLP_KEY, SERIES_DBLP_KEY } from './search'

export const DBLP_URL = 'https://dblp.org';
export const DBLP_SEARCH_AUTHOR_API = '/search/author/api';
export const DBLP_SEARCH_VENUE_API = '/search/venue/api';
export const DBLP_AUTHORS_INDEX_HTML = '/pers';
export const DBLP_JOURNALS_INDEX_HTML = '/db/journals';
export const DBLP_CONF_INDEX_HTML = '/db/conf';
export const DBLP_SERIES_INDEX_HTML = '/db/series';
export const DBLP_BOOKS_INDEX_HTML = '/db/books';
export const DBLP_REFERENCE_INDEX_HTML = '/db/reference';

export const SEARCH_AUTHOR = '/search/author';
export const SEARCH_VENUE = '/search/venue';

export const VENUE_PATH_SEGMENTS = {
    [VenueType.Journal]: JOURNALS_DBLP_KEY,
    [VenueType.Conference]: CONF_DBLP_KEY,
    [VenueType.Series]: SERIES_DBLP_KEY,
    [VenueType.Book]: BOOKS_DBLP_KEY,
    [VenueType.Reference]: REFERENCE_DBLP_KEY,
} as const
