import { PublicationType } from '@/shared/enums/PublicationType'

export const PUBLICATION_TYPE_BG = {
    [PublicationType.BooksAndTheses]: 'bg-books-and-theses',
    [PublicationType.ConferenceAndWorkshopPapers]: 'bg-conference-and-workshop-papers',
    [PublicationType.DataAndArtifacts]: 'bg-data-and-artifacts',
    [PublicationType.Editorship]: 'bg-editorship',
    [PublicationType.InformalAndOther]: 'bg-informal-and-other',
    [PublicationType.JournalArticles]: 'bg-journal-articles',
    [PublicationType.PartsInBooksOrCollections]: 'bg-parts-in-books-or-collections',
    [PublicationType.ReferenceWorks]: 'bg-reference-works',
} as const

export const PUBLICATION_TYPE_COLOR = {
    [PublicationType.BooksAndTheses]: 'text-books-and-theses',
    [PublicationType.ConferenceAndWorkshopPapers]: 'text-conference-and-workshop-papers',
    [PublicationType.DataAndArtifacts]: 'text-data-and-artifacts',
    [PublicationType.Editorship]: 'text-editorship',
    [PublicationType.InformalAndOther]: 'text-informal-and-other',
    [PublicationType.JournalArticles]: 'text-journal-articles',
    [PublicationType.PartsInBooksOrCollections]: 'text-parts-in-books-or-collections',
    [PublicationType.ReferenceWorks]: 'text-reference-works',
} as const

export const PUBLICATION_TYPE_FILL = {
    [PublicationType.BooksAndTheses]: 'fill-books-and-theses',
    [PublicationType.ConferenceAndWorkshopPapers]: 'fill-conference-and-workshop-papers',
    [PublicationType.DataAndArtifacts]: 'fill-data-and-artifacts',
    [PublicationType.Editorship]: 'fill-editorship',
    [PublicationType.InformalAndOther]: 'fill-informal-and-other',
    [PublicationType.JournalArticles]: 'fill-journal-articles',
    [PublicationType.PartsInBooksOrCollections]: 'fill-parts-in-books-or-collections',
    [PublicationType.ReferenceWorks]: 'fill-reference-works',
} as const

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