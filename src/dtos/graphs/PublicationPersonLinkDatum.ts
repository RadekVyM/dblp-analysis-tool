import * as d3 from 'd3'
import { PublicationPersonNodeDatum } from './PublicationPersonNodeDatum'
import { LinkDatum, LinkDatumExtension } from './LinkDatum'

/** Represenets a node of a coauthors graph. */
export type PublicationPersonLinkDatum = {
} & LinkDatum & d3.SimulationLinkDatum<PublicationPersonNodeDatum> & PublicationPersonLinkDatumExtension

/** Additional properties of a node of a coauthors graph. */
export type PublicationPersonLinkDatumExtension = {
    publicationsCount: number,
} & LinkDatumExtension