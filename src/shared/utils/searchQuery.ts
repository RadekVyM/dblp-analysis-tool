export type QueryOptions = {
    exactWords?: boolean,
    userOr?: boolean
}

export function normalizeQuery(query: string, options?: QueryOptions) {
    const separator = options?.userOr ? '|' : ' ';

    const words = query
        .split(' ')
        .filter(s => s.length > 0)
        .map(s => options?.exactWords ? `${s}$` : s)
        .join(separator);

    return words;
}