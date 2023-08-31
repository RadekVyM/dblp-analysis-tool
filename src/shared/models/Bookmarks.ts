export type SavedAuthors = {
    recentlySeen: Array<SavedAuthor>,
    bookmarked: Array<SavedAuthor>,
    groups: Array<SavedAuthorGroup>
}

export type SavedVenues = {
    recentlySeen: Array<SavedVenue>,
    bookmarked: Array<SavedVenue>
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

export type SavedVenue = {
    title: string,
    id: string
}