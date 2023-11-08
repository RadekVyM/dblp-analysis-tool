export type VisitedAuthor = {
    visitsCount?: number
} & SavedAuthor

export type SavedAuthor = {
    title: string,
    id: string
}

export type AuthorGroup = {
    id: string,
    title: string,
    authors: Array<SavedAuthor>,
}