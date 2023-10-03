import { SearchQueryOptions } from '@/models/SearchQueryOptions'

export type BaseItemsParams = {
    first?: number, // zero-based index
    count?: number,
    type?: string
}

export type SearchItemsParams = BaseItemsParams & {
    query?: string,
    queryOptions?: SearchQueryOptions,
    completionsCount?: number
}

export type ItemsIndexParams = BaseItemsParams & {
    prefix?: string
}

export interface SearchAuthorsParams extends SearchItemsParams {
}
