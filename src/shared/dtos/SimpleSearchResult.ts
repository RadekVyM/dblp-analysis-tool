export class SimpleSearchResult {
    constructor(
        public readonly totalCount: number,
        public readonly items: Array<SimpleSearchResultItem>,
    ) {
    }
}

export type SimpleSearchResultItem = {
    title: string,
    url: string,
    additionalInfo?: string
}