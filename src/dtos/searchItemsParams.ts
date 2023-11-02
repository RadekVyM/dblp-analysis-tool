import { SearchQueryOptions } from '@/dtos/SearchQueryOptions'

export type BaseSearchItemsParams = {
    first?: number, // zero-based index
    count?: number,
    type?: string
}

export type SearchItemsParams = BaseSearchItemsParams & {
    query?: string,
    queryOptions?: SearchQueryOptions,
    completionsCount?: number
}

export type ItemsIndexParams = BaseSearchItemsParams & {
    prefix?: string
}

export type SearchAuthorsParams = SearchItemsParams & {
}

export type SearchVenuesParams = SearchItemsParams & {
}