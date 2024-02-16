/** Creates processed result of a search that can be displayed to the user. */
export function createSimpleSearchResult(
    totalCount: number,
    items: Array<SimpleSearchResultItem>,
): SimpleSearchResult {
    return {
        totalCount,
        items
    }
}

/** Processed result of a search that can be displayed to the user. */
export type SimpleSearchResult = {
    readonly totalCount: number,
    readonly items: Array<SimpleSearchResultItem>,
}

/** Item of a processed result of a search. */
export type SimpleSearchResultItem = {
    title: string,
    localUrl: string,
    additionalInfo?: string
}