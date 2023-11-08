export type VisitedVenue = {
    visitsCount?: number
} & SavedVenue

export type SavedVenue = {
    title: string,
    id: string
}