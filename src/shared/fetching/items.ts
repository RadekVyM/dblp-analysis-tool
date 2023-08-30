import { normalizeQuery } from '../utils/searchQuery'
import { urlWithParams } from '../utils/urls'
import { ItemsIndexParams, ItemsParams, handleErrors } from './shared'

export async function queryItemsJson(url: string, params: ItemsParams) {
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

    const response = await fetch(completeUrl, { next: { revalidate: 3600 } });
    await handleErrors(response, 'application/json');

    return response.json();
}

export async function fetchItemsIndexHtml(url: string, params: ItemsIndexParams) {
    const completeUrl = urlWithParams(url, {
        pos: (params.first || 0) + 1,
        prefix: params.prefix
    });

    const response = await fetch(completeUrl, { next: { revalidate: 3600 } });
    await handleErrors(response, 'text/html');

    return response.text();
}