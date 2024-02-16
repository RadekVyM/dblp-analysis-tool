/** Parameters of a local search page. */
export type SearchParams = {
    query?: string | null,
    type?: string,
    page?: string,
    [key: string]: any
}