import * as d3 from 'd3'

/** Represents a node of a graph. */
export type NodeDatum = {
    color?: string,
    colorCssProperty?: string,
} & d3.SimulationNodeDatum

/** Additional properties of a node of a graph. */
export type NodeDatumExtension = {
    isVisible: boolean,
    isHighlighted: boolean,
    isDim: boolean,
    isLabelVisible: boolean,
}

/** Additional properties of a graph node for caching some values for drawing on a canvas. */
export type NodeDatumCanvasExtension = {
    canvasX: number,
    canvasY: number,
    canvasRadius: number,
}