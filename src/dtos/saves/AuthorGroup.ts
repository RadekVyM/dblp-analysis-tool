import { SavedItem } from './SavedItem'
import { SavedAuthor } from './SavedAuthor'

/** A group of authors that can be create by a user. */
export type AuthorGroup = {
    authors: Array<SavedAuthor>,
} & SavedItem