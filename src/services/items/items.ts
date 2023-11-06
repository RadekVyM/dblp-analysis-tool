import { normalizeQuery } from '@/utils/searchQuery'
import { urlWithParams } from '@/utils/urls'
import { fetchHtml, fetchJson } from '@/services/fetch'
import { ItemsIndexParams, SearchItemsParams } from '@/dtos/searchItemsParams'

export async function queryItemsJson(url: string, params: SearchItemsParams) {
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

export async function fetchItemsIndexHtml(url: string, params: ItemsIndexParams) {
    const completeUrl = urlWithParams(url, {
        pos: (params.first || 0) + 1,
        prefix: params.prefix
    });

    return fetchHtml(completeUrl);
}