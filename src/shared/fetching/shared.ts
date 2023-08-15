import { QueryOptions } from '../utils/searchQuery'

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
    first?: number, // zero-based index
    count?: number,
    type?: string
}

export interface ItemsParams extends BaseItemsParams {
    query?: string,
    queryOptions?: QueryOptions,
    completionsCount?: number
}

export interface ItemsIndexParams extends BaseItemsParams {
    prefix?: string
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

    if (!contentType || !contentType.includes(type)) {
        throw new TypeError('Response contains content of an incorrect type.');
    }
}
