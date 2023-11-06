export type SavedAuthors = {
    recentlySeen: Array<SavedAuthor>,
    groups: Array<SavedAuthorGroup>
}

export type SavedAuthor = {
    title: string,
    id: string
}

export type SavedAuthorGroup = {
    id: string,
    title: string,
    authors: Array<SavedAuthor>,
}