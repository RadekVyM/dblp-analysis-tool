export class SimpleSearchResult {
    constructor(
        public readonly totalCount: number,
        public readonly items: Array<SimpleSearchResultItem>,
    ) {
    }
}

export type SimpleSearchResultItem = {
    title: string,
    localUrl: string,
    additionalInfo?: string
}