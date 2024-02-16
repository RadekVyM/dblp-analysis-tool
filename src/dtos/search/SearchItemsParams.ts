import { SearchQueryOptions } from '@/dtos/search/SearchQueryOptions'

/** Basic parameters of a search request to dblp. */
export type BaseSearchItemsParams = {
    first?: number, // zero-based index
    count?: number,
    type?: string
}

/** Parameters of a search request to dblp. */
export type SearchItemsParams = BaseSearchItemsParams & {
    query?: string,
    queryOptions?: SearchQueryOptions,
    completionsCount?: number
}

/** Parameters of a request for a dblp index. */
export type ItemsIndexParams = BaseSearchItemsParams & {
    prefix?: string
}

/** Parameters of a request for the dblp authors index. */
export type SearchAuthorsParams = SearchItemsParams & {
}

/** Parameters of a request for a dblp venues index. */
export type SearchVenuesParams = SearchItemsParams & {
}