/** Default items count per search page. */
export const DEFAULT_ITEMS_COUNT_PER_PAGE = 50;
/** Maximum number of items that can be retreived through the dblp search API.  */
export const MAX_QUERYABLE_ITEMS_COUNT = 10000;
/** Maximum number of authors per dblp index page.  */
export const AUTHORS_COUNT_PER_DBLP_INDEX_PAGE = 300;
/** Maximum number of venues per dblp index page.  */
export const VENUES_COUNT_PER_DBLP_INDEX_PAGE = 100;

/** URL segment that is used for journals. */
export const JOURNALS_DBLP_KEY = 'journals';
/** URL segment that is used for conferences. */
export const CONF_DBLP_KEY = 'conf';
/** URL segment that is used for series. */
export const SERIES_DBLP_KEY = 'series';
/** URL segment that is used for books. */
export const BOOKS_DBLP_KEY = 'books';
/** URL segment that is used for references. */
export const REFERENCE_DBLP_KEY = 'reference';

/** Key that identifies a journal venue in dblp when using the dblp search API. */
export const JOURNALS_DBLP_SEARCH_TYPE = 'Journal';
/** Key that identifies a conference venue in dblp when using the dblp search API. */
export const CONF_DBLP_SEARCH_TYPE = 'Conference_or_Workshop';
/** Key that identifies a series venue in dblp when using the dblp search API. */
export const SERIES_DBLP_SEARCH_TYPE = 'Series';
