import { SavedItem } from './SavedItem'

/** A venue that user can save for easier access. */
export type SavedVenue = {
    venueId: string,
    volumeId?: string
} & SavedItem