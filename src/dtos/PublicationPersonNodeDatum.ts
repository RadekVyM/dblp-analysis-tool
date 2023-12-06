import * as d3 from 'd3'
import { DblpPublicationPerson } from './DblpPublication'

export type PublicationPersonNodeDatum = {
    person: DblpPublicationPerson,
    count: number,
    color?: string,
    colorClass?: string,
    coauthorIds: Set<string>
} & d3.SimulationNodeDatum