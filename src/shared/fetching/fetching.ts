export const DBLP_URL = 'https://dblp.org';
export const DBLP_SEARCH_AUTHOR_API = '/search/author/api';
export const DBLP_SEARCH_VENUE_API = '/search/venue/api';

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

export interface ItemsParams {
    query?: string,
    first?: number,
    count?: number,
    completionsCount?: number
}

export async function handleErrors(response: Response, conentType: string) {
    if (!response.ok) {
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

    throwIfWrongContentType(response, conentType);
}

function throwIfWrongContentType(response: Response, type: string) {
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes(`application/${type}`)) {
        throw new TypeError('Response contains content of an incorrect type.');
    }
}
