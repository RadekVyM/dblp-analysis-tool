import { VenueType } from '@/enums/VenueType'
import { BOOKS_DBLP_KEY, CONF_DBLP_KEY, JOURNALS_DBLP_KEY, REFERENCE_DBLP_KEY, SERIES_DBLP_KEY } from './search'

// This tool works with normalized author and venue IDs, also referred to as local IDs.
// These have slashes replaced by two underscores.
export const ID_LOCAL_SEPARATOR = '__'; // Single '-' cannot be used, PIDs can contain '-'
export const ID_DBLP_SEPARATOR = '/';

// URLs of used dblp.org endpoints.
export const DBLP_URL = 'https://dblp.org';
export const DBLP_SEARCH_AUTHOR_API = '/search/author/api';
export const DBLP_SEARCH_VENUE_API = '/search/venue/api';
export const DBLP_AUTHORS_INDEX_HTML = '/pers';
export const DBLP_JOURNALS_INDEX_HTML = '/db/journals';
export const DBLP_CONF_INDEX_HTML = '/db/conf';
export const DBLP_SERIES_INDEX_HTML = '/db/series';
export const DBLP_BOOKS_INDEX_HTML = '/db/books';
export const DBLP_REFERENCE_INDEX_HTML = '/db/reference';

/** URL of the local search author page. */
export const SEARCH_AUTHOR = '/search/author';
/** URL of the local search venue page. */
export const SEARCH_VENUE = '/search/venue';

/** URL path segments of venue pages in dblp. */
export const VENUE_PATH_SEGMENTS = {
    [VenueType.Journal]: JOURNALS_DBLP_KEY,
    [VenueType.Conference]: CONF_DBLP_KEY,
    [VenueType.Series]: SERIES_DBLP_KEY,
    [VenueType.Book]: BOOKS_DBLP_KEY,
    [VenueType.Reference]: REFERENCE_DBLP_KEY,
} as const;
