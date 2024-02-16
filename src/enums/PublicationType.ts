/** Type of a publication in dblp. */
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

/** Type of a publication in dblp. */
export type PublicationType = keyof typeof PublicationType