import { SavedAuthor } from './SavedAuthor'

/** An author that user visited and can be saved for easier access. */
export type VisitedAuthor = {
    visitsCount?: number
} & SavedAuthor