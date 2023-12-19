/**
 * Returns a result of a promise at certain position, if the promise was fulfilled, otherwise returns null.
 * If there is no promise at that position, throws an error.
 * @param promises Array of results of promises
 * @param position Zero-based index of the promise in the array
 * @returns Result or null
 */
export function getFulfilledValueAt<T>(promises: Array<PromiseSettledResult<any>>, position: number): T | null {
    const at = promises.at(position);

    if (!at) {
        throw new Error('Fulfilled promise value nof found');
    }

    if (at!.status === 'fulfilled') {
        return at?.value as T;
    }

    return null;
}

/**
 * Returns a rejection reason of a promise at certain position, if the promise was rejected, otherwise returns null.
 * If there is no promise at that position, throws an error.
 * @param promises Array of results of promises
 * @param position Zero-based index of the promise in the array
 * @returns Rejection reason or null
 */
export function getRejectedValueAt<T>(promises: Array<PromiseSettledResult<any>>, position: number): T | null {
    const at = promises.at(position);

    if (!at) {
        throw new Error('Rejected promise value nof found');
    }

    if (at!.status === 'rejected') {
        return at?.reason as T;
    }

    return null;
}