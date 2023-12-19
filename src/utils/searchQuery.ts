import { SearchQueryOptions } from '@/dtos/SearchQueryOptions'
import { isNullOrWhiteSpace } from './strings'

/**
 * Normalizes a search query according to defined options.
 * @param query Search query
 * @param options Search query options
 * @returns Normalized search query
 */
export function normalizeQuery(query: string, options?: SearchQueryOptions): string {
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