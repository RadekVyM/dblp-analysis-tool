import { fetchError, badRequestError } from '@/utils/errors'

/**
 * Retreives a content from a cache or calls a fetch request and stores the result to the cache.
 * @param cache A function that stores the result to the cache
 * @param tryGetFromCache A function that tries to retreive the content from the cache 
 * @param fetch A fetch function
 * @returns The fetched value
 */
export async function withCache<T>(
    cache: (value: T) => Promise<void>,
    tryGetFromCache: () => Promise<T | null>,
    fetch: () => Promise<T>
) {
    try {
        const cachedValue = await tryGetFromCache();

        if (cachedValue) {
            return cachedValue;
        }
    }
    catch (e) {
        console.log(`Value could not be resolved from cache.\nError:\n${e}'`);
    }

    const fetchedValue = await fetch();

    try {
        await cache(fetchedValue);
    }
    catch (e) {
        console.log(`Value could not be cached.\nError:\n${e}'`);
    }

    return fetchedValue;
}

/**
 * Sends a GET request which expects XML document to be returned and throws an error if needed.
 * @param url URL of the request
 * @returns XML string
 */
export async function fetchXml(url: string) {
    return fetchWithErrorHandling(url, 'application/xml').then((res) => res.text());
}

/**
 * Sends a GET request which expects SVG image to be returned and throws an error if needed.
 * @param url URL of the request
 * @returns SVG string
 */
export async function fetchSvg(url: string) {
    return fetchWithErrorHandling(url, 'image/svg+xml').then((res) => res.text());
}

/**
 * Sends a GET request which expects HTML document to be returned and throws an error if needed.
 * @param url URL of the request
 * @returns HTML string
 */
export async function fetchHtml(url: string) {
    return fetchWithErrorHandling(url, 'text/html').then((res) => res.text());
}

/**
 * Sends a GET request which expects JSON document to be returned and throws an error if needed.
 * @param url URL of the request
 * @returns Deserialized JSON object
 */
export async function fetchJson(url: string) {
    return fetchWithErrorHandling(url, 'application/json').then((res) => res.json());
}

/**
 * Sends a POST request and throws an error if needed.
 * @param url URL of the request
 * @param data Data passed to the request body
 * @returns Request response
 */
export async function sendPost(url: string, data: any) {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });

    await throwIfNotOk(response);

    return response;
}

/**
 * Sends a DELETE request and throws an error if needed.
 * @param url URL of the request
 * @returns Request response
 */
export async function sendDelete(url: string) {
    const response = await fetch(url, {
        method: 'DELETE'
    });

    await throwIfNotOk(response);

    return response;
}

/**
 * Throws an error if the response status is other than OK or the response content type is incorrect.
 * @param response Response of a fetch request
 * @param contentType Required type of the response content
 */
export async function handleErrors(response: Response, contentType: string) {
    await throwIfNotOk(response);
    throwIfWrongContentType(response, contentType);
}

/** Sends a fetch request and throws an error if needed. */
async function fetchWithErrorHandling(url: string, type: string, options?: any) {
    const response = await fetch(url, { next: { revalidate: 3600 }, ...options });
    await handleErrors(response, type);

    return response;
}

/** Throws an error if the response status is other than OK. */
async function throwIfNotOk(response: Response) {
    if (response.ok) {
        return;
    }

    const retryAfter = response.headers.get('Retry-After') || '60';

    throw fetchError(
        'An error occurred while fetching the data.',
        response.status,
        response.statusText,
        response.url,
        {
            retryAfter: response.status === 429 ? parseInt(retryAfter) : undefined
        });
}

/** Throws an error if the response content type is incorrect. */
function throwIfWrongContentType(response: Response, type: string) {
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes(type)) {
        throw badRequestError('Response contains content of an incorrect type.');
    }
}