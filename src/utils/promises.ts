export function getFulfilledValueAt<T>(promises: Array<PromiseSettledResult<any>>, position: number) {
    const at = promises.at(position);

    if (at!.status == 'fulfilled') {
        return at?.value as T;
    }

    return null;
}

export function getRejectedValueAt<T>(promises: Array<PromiseSettledResult<any>>, position: number) {
    const at = promises.at(position);

    if (at!.status == 'rejected') {
        return at?.reason as T;
    }

    return null;
}