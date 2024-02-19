import { DblpPublicationPerson } from '../../DblpPublication'
import { NodeDatum, NodeDatumCanvasExtension, NodeDatumExtension } from './NodeDatum'

/** Represents a link between two nodes of a coauthors graph. */
export type PublicationPersonNodeDatum = {
    person: DblpPublicationPerson,
    /** Lowered name without accents */
    normalizedPersonName: string,
    /** How many times the person occured in the original data */
    personOccurrenceCount: number,
    coauthorIds: Set<string>,
    isOriginalAuthorNode: boolean,
} & PublicationPersonNodeDatumExtension & NodeDatumCanvasExtension & NodeDatum

/** Additional properties of a link between two nodes of a coauthors graph. */
export type PublicationPersonNodeDatumExtension = {
    isOriginalAuthorNode: boolean,
} & NodeDatumExtension