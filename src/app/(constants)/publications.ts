import { PublicationType } from '@/shared/enums/PublicationType'
import { prependDashedPrefix } from '@/shared/utils/tailwindUtils'

export const PUBLICATION_TYPE_COLOR = {
    [PublicationType.BooksAndTheses]: 'books-and-theses',
    [PublicationType.ConferenceAndWorkshopPapers]: 'conference-and-workshop-papers',
    [PublicationType.DataAndArtifacts]: 'data-and-artifacts',
    [PublicationType.Editorship]: 'editorship',
    [PublicationType.InformalAndOther]: 'informal-and-other',
    [PublicationType.JournalArticles]: 'journal-articles',
    [PublicationType.PartsInBooksOrCollections]: 'parts-in-books-or-collections',
    [PublicationType.ReferenceWorks]: 'reference-works',
} as const

export const PUBLICATION_TYPE_BG = createColorMap('bg')

export const PUBLICATION_TYPE_TEXT_COLOR = createColorMap('text')

export const PUBLICATION_TYPE_FILL = createColorMap('fill')

export const PUBLICATION_TYPE_STROKE = createColorMap('stroke')

export const PUBLICATION_TYPE_TITLE = {
    [PublicationType.BooksAndTheses]: 'Books and Theses',
    [PublicationType.ConferenceAndWorkshopPapers]: 'Conference and Workshop Papers',
    [PublicationType.DataAndArtifacts]: 'Data and Artifacts',
    [PublicationType.Editorship]: 'Editorship',
    [PublicationType.InformalAndOther]: 'Informal and Other Publications',
    [PublicationType.JournalArticles]: 'Journal Articles',
    [PublicationType.PartsInBooksOrCollections]: 'Parts in Books or Collections',
    [PublicationType.ReferenceWorks]: 'Reference Works',
} as const

export const PUBLICATION_TYPE_TITLE_SINGULAR = {
    [PublicationType.BooksAndTheses]: 'Book or Theses',
    [PublicationType.ConferenceAndWorkshopPapers]: 'Conference or Workshop Paper',
    [PublicationType.DataAndArtifacts]: 'Data or Artifact',
    [PublicationType.Editorship]: 'Editorship',
    [PublicationType.InformalAndOther]: 'Informal or Other Publication',
    [PublicationType.JournalArticles]: 'Journal Article',
    [PublicationType.PartsInBooksOrCollections]: 'Part in a Book or Collection',
    [PublicationType.ReferenceWorks]: 'Reference Work',
} as const

function createColorMap(prefix: string) {
    return {
        [PublicationType.BooksAndTheses]: prependDashedPrefix(prefix, PUBLICATION_TYPE_COLOR[PublicationType.BooksAndTheses]),
        [PublicationType.ConferenceAndWorkshopPapers]: prependDashedPrefix(prefix, PUBLICATION_TYPE_COLOR[PublicationType.ConferenceAndWorkshopPapers]),
        [PublicationType.DataAndArtifacts]: prependDashedPrefix(prefix, PUBLICATION_TYPE_COLOR[PublicationType.DataAndArtifacts]),
        [PublicationType.Editorship]: prependDashedPrefix(prefix, PUBLICATION_TYPE_COLOR[PublicationType.Editorship]),
        [PublicationType.InformalAndOther]: prependDashedPrefix(prefix, PUBLICATION_TYPE_COLOR[PublicationType.InformalAndOther]),
        [PublicationType.JournalArticles]: prependDashedPrefix(prefix, PUBLICATION_TYPE_COLOR[PublicationType.JournalArticles]),
        [PublicationType.PartsInBooksOrCollections]: prependDashedPrefix(prefix, PUBLICATION_TYPE_COLOR[PublicationType.PartsInBooksOrCollections]),
        [PublicationType.ReferenceWorks]:  prependDashedPrefix(prefix, PUBLICATION_TYPE_COLOR[PublicationType.ReferenceWorks]),
    } as const
}