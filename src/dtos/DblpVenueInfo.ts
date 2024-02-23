import { DblpVenueTopAuthor } from './DblpVenueTopAuthor'

export type DblpVenueAuthorsInfo = {
    topAuthors: Array<DblpVenueTopAuthor>,
    totalAuthorsCount: number
}

export function createDblpVenueAuthorsInfo(
    topAuthors: Array<DblpVenueTopAuthor>,
    totalAuthorsCount: number
): DblpVenueAuthorsInfo {
    return {
        topAuthors,
        totalAuthorsCount,
    };
}