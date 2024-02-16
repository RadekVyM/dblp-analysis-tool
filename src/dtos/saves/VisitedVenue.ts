import { SavedVenue } from './SavedVenue'

/** A venue that user visited and can be saved for easier access. */
export type VisitedVenue = {
    visitsCount?: number
} & SavedVenue