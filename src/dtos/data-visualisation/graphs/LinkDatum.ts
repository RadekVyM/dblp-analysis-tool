import * as d3 from 'd3'
import { NodeDatum, NodeDatumExtension } from './NodeDatum'

/** Represents a link between two nodes of a graph. */
export type LinkDatum = {
    weight: number,
} & d3.SimulationLinkDatum<NodeDatum & NodeDatumExtension>

/** Additional properties of a link between two nodes of a graph. */
export type LinkDatumExtension = {
    isIgnored: boolean,
    isVisible: boolean,
    intensity: number,
    isHighlighted: boolean,
    isDim: boolean
}