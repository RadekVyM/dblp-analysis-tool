import * as d3 from 'd3'
import { DblpPublicationPerson } from './DblpPublication'

export type PublicationPersonNodeDatum = {
    person: DblpPublicationPerson,
    normalizedPersonName: string,
    count: number,
    color?: string,
    colorCssProperty?: string,
    coauthorIds: Set<string>,
} & PublicationPersonNodeDatumExtension & PublicationPersonNodeDatumCanvasExtension & d3.SimulationNodeDatum

export type PublicationPersonNodeDatumExtension = {
    isVisible: boolean,
    isHighlighted: boolean,
    isDim: boolean,
    isLabelVisible: boolean,
    isOriginalAuthorNode: boolean,
}

export type PublicationPersonNodeDatumCanvasExtension = {
    canvasX: number,
    canvasY: number,
    canvasRadius: number,
}