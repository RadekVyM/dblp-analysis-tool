import * as d3 from 'd3'
import { NodeDatum, NodeDatumExtension } from './NodeDatum'

/** Represents a link between two nodes of a graph. */
export type LinkDatum = {
} & d3.SimulationLinkDatum<NodeDatum & NodeDatumExtension>

/** Additional properties of a link between two nodes of a graph. */
export type LinkDatumExtension = {
    isVisible: boolean,
    intensity: number,
    isHighlighted: boolean,
    isDim: boolean
}