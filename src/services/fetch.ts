import { FetchError } from '@/dtos/FetchError'

export async function fetchXml(url: string) {
    return fetchWithErrorHandling(url, 'application/xml').then((res) => res.text());
}

export async function fetchHtml(url: string) {
    return fetchWithErrorHandling(url, 'text/html').then((res) => res.text());
}

export async function fetchJson(url: string) {
    return fetchWithErrorHandling(url, 'application/json').then((res) => res.json());
}

export async function sendPost(url: string, data: any) {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
    })

    await throwIfNotOk(response);

    return response
}

export async function sendDelete(url: string) {
    const response = await fetch(url, {
        method: 'DELETE'
    })
    
    await throwIfNotOk(response);

    return response
}

export async function handleErrors(response: Response, conentType: string) {
    await throwIfNotOk(response);
    throwIfWrongContentType(response, conentType);
}

async function fetchWithErrorHandling(url: string, type: string, options?: any) {
    const response = await fetch(url, { next: { revalidate: 3600 }, ...options });
    await handleErrors(response, type);

    return response;
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
            retryAfter: response.status === 429 ? parseInt(retryAfter) : undefined
        });
}

function throwIfWrongContentType(response: Response, type: string) {
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes(type)) {
        throw new TypeError('Response contains content of an incorrect type.');
    }
}