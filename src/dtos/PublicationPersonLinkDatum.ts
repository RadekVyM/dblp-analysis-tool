import * as d3 from 'd3'
import { PublicationPersonNodeDatum } from './PublicationPersonNodeDatum'

export type PublicationPersonLinkDatum = {
    publicationsCount: number  
} & d3.SimulationLinkDatum<PublicationPersonNodeDatum>