import { urlWithParams } from "../utils/urls";
import { ItemsParams, handleErrors } from "./fetching";

export async function fetchItems(url: string, params: ItemsParams) {
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