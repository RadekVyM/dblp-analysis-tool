/** Search parameters for publication pages. */
export type PublicationsSearchParams = {
    year?: Array<string> | string,
    type?: Array<string> | string,
    venueId?: Array<string> | string,
    authorId?: Array<string> | string,
}