import { urlWithParams } from "../utils/urls";
import { BaseItemsParams, ItemsParams, handleErrors } from "./fetching";

export async function queryItemsJson(url: string, params: ItemsParams) {
    params.first ??= 0;
    params.count ??= 10;
    params.completionsCount ??= 0;

    const completeUrl = urlWithParams(url, {
        q: params.query,
        f: params.first,
        h: params.count,
        c: params.completionsCount,
        format: 'json'
    });

    const response = await fetch(completeUrl);
    await handleErrors(response, 'json');

    return response.json();
}

export async function fetchItemsHtml(url: string, params: BaseItemsParams) {
    params.first ??= 1;

    const completeUrl = urlWithParams(url, {
        pos: params.first
    });

    const response = await fetch(completeUrl);
    await handleErrors(response, 'html');

    return response.text();
}