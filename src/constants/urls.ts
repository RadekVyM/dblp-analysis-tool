import { VenueType } from '@/enums/VenueType'
import { CONF_DBLP_KEY, JOURNALS_DBLP_KEY, SERIES_DBLP_KEY } from './search'

export const DBLP_URL = 'https://dblp.org';
export const DBLP_SEARCH_AUTHOR_API = '/search/author/api';
export const DBLP_SEARCH_VENUE_API = '/search/venue/api';
export const DBLP_AUTHORS_INDEX_HTML = '/pers';
export const DBLP_JOURNALS_INDEX_HTML = '/db/journals';
export const DBLP_CONF_INDEX_HTML = '/db/conf';
export const DBLP_SERIES_INDEX_HTML = '/db/series';

export const SEARCH_AUTHOR = '/search/author';
export const SEARCH_VENUE = '/search/venue';

export const VENUE_PATH_SEGMENTS = {
    [VenueType.Journal]: JOURNALS_DBLP_KEY,
    [VenueType.Conference]: CONF_DBLP_KEY,
    [VenueType.Series]: SERIES_DBLP_KEY,
} as const
