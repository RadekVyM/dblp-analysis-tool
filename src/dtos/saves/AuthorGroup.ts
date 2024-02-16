import { SavedAuthor } from './SavedAuthor'

/** A group of authors that can be create by a user. */
export type AuthorGroup = {
    id: string,
    title: string,
    authors: Array<SavedAuthor>,
}