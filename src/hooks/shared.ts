'use client'

import { sendDelete, sendPost } from '@/services/fetch'

/**
 * Sends a POST request with specified data and URL path parameters.
 * @param url URL of the request
 * @param param1 Data that are put to the body of the request and URL parameters
 * @returns Typed request response
 */
export async function sendPostRequest<DataT, ResultT>(url: string, { arg }: { arg: { data: DataT, urlParams?: Array<any> } }) {
    return sendPost(`${url}${arg.urlParams ? `/${arg.urlParams.join('/')}` : ''}`, arg.data)
        .then(res => res.json() as ResultT);
}

/**
 * Sends a DELETE request with specified URL path parameters.
 * @param url URL of the request
 * @param param1 URL parameters
 * @returns Returned text
 */
export async function sendDeleteRequest(url: string, { arg }: { arg: Array<any> }) {
    return sendDelete(`${url}/${arg.join('/')}`)
        .then(res => res.text());
}