import * as d3 from 'd3'
import { DblpPublicationPerson } from './DblpPublication'

export type PublicationPersonNodeDatum = {
    person: DblpPublicationPerson,
    count: number,
    color?: string,
    colorCssProperty?: string,
    coauthorIds: Set<string>,
} & PublicationPersonNodeDatumExtension & d3.SimulationNodeDatum

export type PublicationPersonNodeDatumExtension = {
    isVisible: boolean,
    isHighlighted: boolean,
    isDim: boolean
}