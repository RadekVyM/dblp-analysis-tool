import * as d3 from 'd3'
import { PublicationPersonNodeDatum } from './PublicationPersonNodeDatum'

export type PublicationPersonLinkDatum = {
} & d3.SimulationLinkDatum<PublicationPersonNodeDatum> & PublicationPersonLinkDatumExtension

export type PublicationPersonLinkDatumExtension = {
    publicationsCount: number,
    isVisible: boolean,
    intensity: number
}