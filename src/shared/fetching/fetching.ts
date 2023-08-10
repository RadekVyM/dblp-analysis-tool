export const DBLP_URL = 'https://dblp.org';
export const DBLP_SEARCH_AUTHOR_API = '/search/author/api';
export const DBLP_SEARCH_VENUE_API = '/search/venue/api';
export const DBLP_AUTHORS_INDEX_HTML = '/pers';
export const DBLP_JOURNALS_INDEX_HTML = '/db/journals';
export const DBLP_CONF_INDEX_HTML = '/db/conf';
export const DBLP_SERIES_INDEX_HTML = '/db/series';

interface FetchErrorOptions extends ErrorOptions {
    status?: number,
    statusText?: string,
    retryAfter?: number
}

export class FetchError extends Error {
    public readonly status?: number
    public readonly statusText?: string
    public readonly retryAfter?: number

    constructor(message?: string, options?: FetchErrorOptions) {
        super(message, options);

        this.status = options?.status
        this.statusText = options?.statusText
    }
}

export interface BaseItemsParams {
    first?: number,
    count?: number
}

export interface ItemsParams extends BaseItemsParams {
    query?: string,
    completionsCount?: number
}

export async function handleErrors(response: Response, conentType: string) {
    await throwIfNotOk(response);
    throwIfWrongContentType(response, conentType);
}

async function throwIfNotOk(response: Response) {
    if (response.ok) {
        return;
    }

    const retryAfter = response.headers.get('Retry-After') || '60';
    const cause = await response.text();

    throw new FetchError(
        'An error occurred while fetching the data.',
        {
            cause: cause,
            status: response.status,
            statusText: response.statusText,
            retryAfter: response.status == 429 ? parseInt(retryAfter) : undefined
        });
}

function throwIfWrongContentType(response: Response, type: string) {
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes(`application/${type}`)) {
        throw new TypeError('Response contains content of an incorrect type.');
    }
}
