import { SearchQueryOptions } from '@/dtos/SearchQueryOptions'
import { isNullOrWhiteSpace } from './strings';

export function normalizeQuery(query: string, options?: SearchQueryOptions) {
    const separator = options?.useOr ? '|' : ' ';

    if (isNullOrWhiteSpace(query)) {
        return query;
    }

    return query
        .split(' ')
        .filter(s => s.length > 0)
        .map(s => options?.exactWords ? `${s}$` : s)
        .join(separator);
}