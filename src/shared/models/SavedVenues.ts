export type SavedVenues = {
    recentlySeen: Array<SavedVenue>,
    bookmarked: Array<SavedVenue>
}

export type SavedVenue = {
    title: string,
    id: string
}