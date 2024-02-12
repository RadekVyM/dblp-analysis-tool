import { normalizeQuery } from '@/utils/searchQuery'
import { urlWithParams } from '@/utils/urls'
import { fetchHtml, fetchJson } from '@/services/fetch'
import { ItemsIndexParams, SearchItemsParams } from '@/dtos/searchItemsParams'

/**
 * Requests items from a JSON dblp endpoint.
 * Used mainly for searching the database.
 * 
 * It is not possible to get more than first 10000 satisfactory results.
 * This is a limit set by dblp.
 * 
 * @param url URL of the endpoint
 * @param params Parameters of the request
 * @returns The response containing a deserialized JSON object
 */
export async function fetchItemsJson(url: string, params: SearchItemsParams) {
    params.first ??= 0;
    params.count ??= 10;
    params.completionsCount ??= 0;

    const completeUrl = urlWithParams(url, {
        q: params.query ? normalizeQuery(params.query, params.queryOptions) : params.query,
        f: params.first,
        h: params.count,
        c: params.completionsCount,
        format: 'json'
    });

    return fetchJson(completeUrl);
}

/**
 * Requests a page of a dblp index.
 * @param url URL of the index
 * @param params Parameters of the request
 * @returns The response containing a HTML string
 */
export async function fetchItemsIndexHtml(url: string, params: ItemsIndexParams) {
    const completeUrl = urlWithParams(url, {
        pos: (params.first || 0) + 1,
        prefix: params.prefix
    });

    return fetchHtml(completeUrl);
}