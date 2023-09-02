export const PublicationType = {
    BooksAndTheses: 'BooksAndTheses',
    JournalArticles: 'JournalArticles',
    ConferenceAndWorkshopPapers: 'ConferenceAndWorkshopPapers',
    PartsInBooksOrCollections: 'PartsInBooksOrCollections',
    Editorship: 'Editorship',
    ReferenceWorks: 'ReferenceWorks',
    DataAndArtifacts: 'DataAndArtifacts',
    InformalAndOther: 'InformalAndOther',
} as const

export type PublicationType = keyof typeof PublicationType