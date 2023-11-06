export type SavedAuthors = {
    recentlySeen: Array<SavedAuthor>,
    groups: Array<AuthorGroup>
}

export type SavedAuthor = {
    title: string,
    id: string
}

export type AuthorGroup = {
    id: string,
    title: string,
    authors: Array<SavedAuthor>,
}