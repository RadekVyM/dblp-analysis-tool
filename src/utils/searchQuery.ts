import { SearchQueryOptions } from '@/models/SearchQueryOptions'

export function normalizeQuery(query: string, options?: SearchQueryOptions) {
    const separator = options?.userOr ? '|' : ' ';

    const words = query
        .split(' ')
        .filter(s => s.length > 0)
        .map(s => options?.exactWords ? `${s}$` : s)
        .join(separator);

    return words;
}