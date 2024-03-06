'use client'

import { delay } from '@/utils/promises'

const WAITING_TIME_BETWEEN_REQUESTS = 100;
let lastFetchTime = 0;

/**
 * Ensures that the client waits between two subsequent request at least 100 milliseconds.
 * This helps to properly wait on the server where the waitForNextFetch() function is used.
 * See the waitForNextFetch() function for more information about its limitations.
 * 
 * The proper solution on the server is needed because the user can edit this code.
 */
export default async function waitForNextFetchClient() {
    const nowTime = new Date().getTime();
    const newFetchTime = (nowTime - lastFetchTime) > WAITING_TIME_BETWEEN_REQUESTS ?
        nowTime :
        lastFetchTime + WAITING_TIME_BETWEEN_REQUESTS;
    const waitFor = newFetchTime - new Date().getTime();
    lastFetchTime = newFetchTime;

    if (waitFor > 0) {
        await delay(waitFor);
    }
}