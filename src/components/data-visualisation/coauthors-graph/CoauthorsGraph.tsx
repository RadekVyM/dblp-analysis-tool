'use client'

import { PublicationPersonNodeDatum } from '@/dtos/PublicationPersonNodeDatum'
import { PublicationPersonLinkDatum } from '@/dtos/PublicationPersonLinkDatum'
import * as d3 from 'd3'
import { MouseEvent, RefObject, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import LoadingWheel from '../../LoadingWheel'
import { cn } from '@/utils/tailwindUtils'
import { EdgeRect } from '@/dtos/Rect'
import { CoauthorsGraphState } from '@/dtos/CoauthorsGraph'
import { ZoomTransform } from '@/hooks/useZoom'
import { DataVisualisationCanvas, DataVisualisationCanvasRef } from '../DataVisualisationCanvas'
import { Inter } from 'next/font/google'
import { DblpPublicationPerson } from '@/dtos/DblpPublication'

const inter = Inter({ subsets: ['latin'] });

const DEFAULT_GRAPH_WIDTH = 400;
const DEFAULT_GRAPH_HEIGHT = 300;
const MAX_SCALE_EXTENT = 10;

type CoauthorsGraphParams = {
    onAuthorClick: (id: string) => void,
    onHoverChange: (id: string | null, isHovered: boolean) => void,
    graph: CoauthorsGraphState,
    ignoredNodeIds?: Array<string>,
    className?: string
}

export type CoauthorsGraphWorkerData = {
    nodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    graphWidth: number,
    graphHeight: number
}

export type CoauthorsGraphWorkerResult = {
    type: 'end' | 'tick'
} & Partial<{
    nodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    progress: number
}>

export type CoauthorsGraphRef = {
    zoomToCenter: () => void,
    graphRef: RefObject<DataVisualisationCanvasRef | null>
}

const CoauthorsGraph = forwardRef<CoauthorsGraphRef, CoauthorsGraphParams>(({
    graph,
    ignoredNodeIds,
    className,
    onAuthorClick,
    onHoverChange
}: CoauthorsGraphParams, ref) => {
    const graphRef = useRef<DataVisualisationCanvasRef | null>(null);
    const [zoomTransform, setZoomTransform] = useState<ZoomTransform>({ scale: 1, x: 0, y: 0 });
    const [dimensions, setDimensions] = useState<{ width: number, height: number } | null>(null);
    const { computedNodes, computedLinks, progress } = useComputedNodesAndLinks(graph, ignoredNodeIds);
    const { onCanvasClick, onCanvasPointerMove, onCanvasPointerLeave } = useCanvas(
        graphRef,
        zoomTransform,
        graph,
        computedLinks,
        computedNodes,
        dimensions || { width: 0, height: 0 },
        onAuthorClick,
        onHoverChange);
    const zoomScaleExtent = useMemo(() => {
        if (!dimensions || dimensions.width == 0 || dimensions.height == 0 || computedNodes.length <= 0) {
            return { min: 1, max: MAX_SCALE_EXTENT };
        }

        const min = getMinZoomScale(computedNodes, dimensions);

        return {
            min: min,
            max: MAX_SCALE_EXTENT
        };
    }, [dimensions, computedNodes]);

    useImperativeHandle(ref, () => ({
        graphRef: graphRef,
        zoomToCenter: zoomToCenter
    }), [zoomToCenter]);

    useEffect(() => {
        // If this timeout is not set, the graph freezes
        // It is not the best solution, but it works
        // TODO: Try to find out what is the root cause of this behavior
        const timeout = setTimeout(() => {
            graphRef.current?.zoomTo({ scale: zoomScaleExtent.min || 1, x: 0, y: 0 });
        }, 100);

        return () => { clearTimeout(timeout); };
    }, [zoomScaleExtent]);

    function zoomToCenter() {
        graphRef.current?.zoomTo({ scale: zoomScaleExtent.min || 1, x: 0, y: 0 });
    }

    return (
        <div
            className={cn(className, 'grid')}>
            {
                (computedNodes && computedNodes.length > 0) && (computedLinks && computedLinks.length > 0) &&
                <DataVisualisationCanvas
                    ref={graphRef}
                    className='w-full h-full row-start-1 row-end-2 col-start-1 col-end-2'
                    zoomScaleExtent={zoomScaleExtent}
                    onZoomChange={(transform) => setZoomTransform(transform)}
                    onDimensionsChange={(width, height) => setDimensions({ width, height })}
                    onClick={onCanvasClick}
                    onPointerMove={onCanvasPointerMove}
                    onPointerLeave={onCanvasPointerLeave} />
            }
            {
                !(computedNodes && computedNodes.length > 0) &&
                <div
                    className='place-self-center row-start-1 row-end-2 col-start-1 col-end-2 text-on-surface-container-muted flex flex-col items-center gap-2'>
                    <LoadingWheel
                        className='w-10 h-10' />
                    <span className='text-sm'>{progress.toLocaleString(undefined, { maximumFractionDigits: 0, style: 'percent' })}</span>
                </div>
            }
        </div>
    )
});

CoauthorsGraph.displayName = 'CoauthorsGraph';
export default CoauthorsGraph;

/** Hook that handles the simulation that positions the nodes and links. */
function useComputedNodesAndLinks(graph: CoauthorsGraphState, ignoredNodeIds?: Array<string>) {
    const [computedNodes, setComputedNodes] = useState<Array<PublicationPersonNodeDatum>>([]);
    const [computedLinks, setComputedLinks] = useState<Array<PublicationPersonLinkDatum>>([]);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        setComputedNodes([]);
        setComputedLinks([]);
        setProgress(0);

        const filteredNodes = (ignoredNodeIds?.length || 0) > 0 ?
            graph.nodes.filter((n) => !ignoredNodeIds?.some(id => n.person.id === id)) :
            graph.nodes;

        const graphWorker = new Worker(new URL('./graphSimulationWorker', import.meta.url));

        // Listen to the events generated by the simulation
        graphWorker.onmessage = (event: MessageEvent<CoauthorsGraphWorkerResult>) => {
            switch (event.data.type) {
                case 'tick':
                    setProgress(event.data.progress || 0);
                    break;
                case 'end':
                    // Different instances are sent back from the web worker
                    // I need to map their computed values to my instances
                    mapComputedNodesAndLinks(event, filteredNodes, graph);
                    setComputedNodes([...filteredNodes]);
                    setComputedLinks([...graph.links]);
                    break;
            }
        };

        graphWorker.onerror = (event) => {
            if (event instanceof Event) {
                return event;
            }
        };

        // Start the simulation in the web worker
        graphWorker.postMessage({
            nodes: filteredNodes,
            links: graph.links,
            graphWidth: DEFAULT_GRAPH_WIDTH,
            graphHeight: DEFAULT_GRAPH_HEIGHT
        } as CoauthorsGraphWorkerData);

        return () => {
            graphWorker.terminate();
        };
    }, [graph.nodes, graph.links, ignoredNodeIds]);

    return { computedNodes, computedLinks, progress };
}

/** Hook that handles all the canvas logic - pointer events and drawing. */
function useCanvas(
    ref: RefObject<DataVisualisationCanvasRef | null>,
    zoomTransform: ZoomTransform,
    graph: CoauthorsGraphState,
    links: Array<PublicationPersonLinkDatum>,
    nodes: Array<PublicationPersonNodeDatum>,
    dimensions: { width: number, height: number },
    onNodeClick: (id: string) => void,
    onNodeHoverChange: (id: string | null, isHovered: boolean) => void
) {
    const canvas = ref.current?.element;
    const simulation = useMemo(() => d3.forceSimulation(nodes).stop(), [nodes]);

    useEffect(() => {
        const context = canvas?.getContext('2d');

        if (!context || links.length === 0) {
            return;
        }

        context.save();

        context.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);

        context.translate(zoomTransform.x, zoomTransform.y);
        context.scale(zoomTransform.scale, zoomTransform.scale);

        drawLinks(
            links,
            context,
            zoomTransform,
            dimensions,
            graph.justDimInvisibleNodes);
        drawNodes(
            nodes,
            dimensions,
            context,
            zoomTransform.scale,
            graph.justDimInvisibleNodes);

        context.restore();
    }, [zoomTransform, links, nodes, dimensions, graph]);

    function onClick(event: MouseEvent) {
        const node = findNode(event);

        if (node) {
            onNodeClick(node.person.id);
        }
    }

    function onPointerMove(event: MouseEvent) {
        const node = findNode(event);

        if (node && (node.isVisible || graph.justDimInvisibleNodes)) {
            onNodeHoverChange(node.person.id, true);
        }
        else {
            onNodeHoverChange(null, false);
        }
    }

    function onPointerLeave(event: MouseEvent) {
        if (graph.hoveredAuthorId) {
            onNodeHoverChange(graph.hoveredAuthorId, false);
        }
    }

    function findNode(event: MouseEvent) {
        const point = invertPoint(d3.pointer(event), zoomTransform);
        return simulation.find(toDefaultX(point[0], dimensions), toDefaultY(point[1], dimensions), 10);
    }

    return {
        onCanvasClick: onClick,
        onCanvasPointerMove: onPointerMove,
        onCanvasPointerLeave: onPointerLeave,
    };
}

/** Draws all nodes onto the canvas context. This function decides which nodes should be drawn highlighted or dim. */
function drawNodes(
    nodes: Array<PublicationPersonNodeDatum>,
    dimensions: { width: number; height: number },
    context: CanvasRenderingContext2D,
    scale: number,
    justDimInvisibleNodes: boolean
) {
    const labeledNodes: Array<PublicationPersonNodeDatum> = [];
    const coloredNodes = new Map<string, Array<PublicationPersonNodeDatum>>();
    const normalNodes: Array<PublicationPersonNodeDatum> = [];
    const semitransparentNormalNodes: Array<PublicationPersonNodeDatum> = [];
    const computedStyle = getComputedStyle(context.canvas);

    context.save();

    context.beginPath();

    for (const node of nodes) {
        const isCompletelyInvisible = !justDimInvisibleNodes && !node.isVisible;

        if (isCompletelyInvisible || !node.x || !node.y) {
            continue;
        }

        node.canvasX = toDimensionsX(node.x, dimensions);
        node.canvasY = toDimensionsY(node.y, dimensions);
        node.canvasRadius = node.isHighlighted ? 10 : isSemivisible(justDimInvisibleNodes, node) || node.isDim ? 2 : 4;

        addNodeToPath(context, node, node.canvasRadius + 1.3);

        placeNodeToRightGroup(node, computedStyle, labeledNodes, coloredNodes, normalNodes, semitransparentNormalNodes);
    }

    context.closePath();
    context.fillStyle = computedStyle.getPropertyValue('--surface-container');
    context.fill();

    drawNormalNodes(context, normalNodes, computedStyle);

    context.globalAlpha = 0.5;
    drawNormalNodes(context, semitransparentNormalNodes, computedStyle);
    context.globalAlpha = 1;

    drawColoredNodes(context, coloredNodes);

    drawNodeLabels(context, scale, labeledNodes);

    context.restore();
}

function placeNodeToRightGroup(
    node: PublicationPersonNodeDatum,
    computedStyle: CSSStyleDeclaration,
    labeledNodes: Array<PublicationPersonNodeDatum>,
    coloredNodes: Map<string, Array<PublicationPersonNodeDatum>>,
    normalNodes: Array<PublicationPersonNodeDatum>,
    semitransparentNormalNodes: Array<PublicationPersonNodeDatum>
) {
    const color = node.color || (node.colorCssProperty && computedStyle.getPropertyValue(node.colorCssProperty));

    if (node.isHighlighted) {
        labeledNodes.push(node);
    }

    if (color) {
        const existingNodes = coloredNodes.get(color);
        if (existingNodes) {
            existingNodes.push(node);
            coloredNodes.set(color, existingNodes);
        }
        else {
            coloredNodes.set(color, [node]);
        }
        return;
    }

    if (node.isVisible) {
        normalNodes.push(node);
    }
    else {
        semitransparentNormalNodes.push(node);
    }
}

function isSemivisible(justDimInvisibleNodes: boolean, node: PublicationPersonNodeDatum) {
    return justDimInvisibleNodes && !node.isVisible;
}

function drawColoredNodes(context: CanvasRenderingContext2D, coloredNodes: Map<string, PublicationPersonNodeDatum[]>) {
    for (const color of coloredNodes.keys()) {
        const nodes = coloredNodes.get(color);

        if (!nodes) {
            continue;
        }

        context.beginPath();

        for (const node of nodes) {
            addNodeToPath(context, node);
        }

        context.closePath();

        context.fillStyle = color;
        context.fill();
    }
}

function drawNormalNodes(
    context: CanvasRenderingContext2D,
    nodes: Array<PublicationPersonNodeDatum>,
    computedStyle: CSSStyleDeclaration
) {
    context.beginPath();

    for (const node of nodes) {
        addNodeToPath(context, node);
    }

    context.closePath();
    context.fillStyle = computedStyle.getPropertyValue('--on-surface-container');
    context.fill();
}

function drawNodeLabels(
    context: CanvasRenderingContext2D,
    scale: number,
    nodes: Array<PublicationPersonNodeDatum>
) {
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeStyle = 'white';
    context.fillStyle = 'black';
    context.lineWidth = 4 / scale;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.font = `bold ${16 / scale}px ${inter.style.fontFamily}`;

    for (const node of nodes) {
        const x = node.canvasX;
        const y = node.canvasY;

        context.moveTo(x, y);
        context.strokeText(node.person.name, x, y);
        context.fillText(node.person.name, x, y);
    }
}

function addNodeToPath(context: CanvasRenderingContext2D, node: PublicationPersonNodeDatum, radius?: number) {
    context.moveTo(node.canvasX, node.canvasY);
    context.arc(node.canvasX, node.canvasY, radius || node.canvasRadius, 0, 2 * Math.PI);
}

/** Draws all links onto the canvas context. */
function drawLinks(
    links: PublicationPersonLinkDatum[],
    context: CanvasRenderingContext2D,
    zoomTransform: ZoomTransform,
    dimensions: { width: number; height: number },
    justDimInvisibleNodes: boolean
) {
    const defaultColor = getComputedStyle(context.canvas).getPropertyValue('--on-surface-container-muted');

    context.save();

    for (const link of links) {
        if (typeof link.source !== 'object' || typeof link.target !== 'object') {
            // The simulation is not finished yet 
            continue;
        }

        const source = link.source as PublicationPersonNodeDatum;
        const target = link.target as PublicationPersonNodeDatum;

        if (!link.isVisible || (!justDimInvisibleNodes && (!source.isVisible || !target.isVisible))) {
            continue;
        }

        drawLine(source, target, link.intensity, defaultColor, context, zoomTransform, link.isHighlighted, link.isDim, justDimInvisibleNodes, dimensions);
    }

    context.restore();
}

/** Draws a line between two points onto the canvas context. */
function drawLine(
    source: PublicationPersonNodeDatum,
    target: PublicationPersonNodeDatum,
    intensity: number,
    color: string,
    context: CanvasRenderingContext2D,
    zoomTransform: ZoomTransform,
    isHighlighted: boolean,
    isDim: boolean,
    justDimInvisibleNodes: boolean,
    dimensions: { width: number; height: number }
) {
    if (source.x && source.y && target.x && target.y) {
        const defaultAlpha = isDim ? 0.1 : isHighlighted ? 0.6 : 0.2 + 0.2 * intensity;
        context.globalAlpha = isSemivisible(justDimInvisibleNodes, target) || isSemivisible(justDimInvisibleNodes, source) ?
            defaultAlpha * 0.5 :
            defaultAlpha;
        context.strokeStyle = color;
        context.lineWidth = Math.max(0.5, (isHighlighted ? 2 : 1) / (Math.max(0.9, zoomTransform.scale)));

        context.beginPath();
        context.moveTo(toDimensionsX(source.x, dimensions), toDimensionsY(source.y, dimensions));
        context.lineTo(toDimensionsX(target.x, dimensions), toDimensionsY(target.y, dimensions));
        context.stroke();
        context.closePath();
    }
}

/** Translates the point according to the zoom transform and converts it to the default coordinates of the graph that is generated by the simulation. */
function invertPoint(point: [number, number], zoomTransform: ZoomTransform) {
    const t = d3.zoomIdentity
        .translate(zoomTransform.x, zoomTransform.y)
        .scale(zoomTransform.scale);

    return t.invert(point)
}

/** Converts the default X coordinate of the graph that is generated by the simulation to the actual X coordinate on the canvas. */
function toDimensionsX(x: number, dimensions: { width: number, height: number }) {
    return x + ((dimensions.width - DEFAULT_GRAPH_WIDTH) / 2)
}

/** Converts the default Y coordinate of the graph that is generated by the simulation to the actual Y coordinate on the canvas. */
function toDimensionsY(y: number, dimensions: { width: number, height: number }) {
    return y + ((dimensions.height - DEFAULT_GRAPH_HEIGHT) / 2)
}

/** Converts the actual X coordinate on the canvas to the default X coordinate of the graph that is generated by the simulation. */
function toDefaultX(x: number, dimensions: { width: number, height: number }) {
    return x - ((dimensions.width - DEFAULT_GRAPH_WIDTH) / 2)
}

/** Converts the actual Y coordinate on the canvas to the default Y coordinate of the graph that is generated by the simulation. */
function toDefaultY(y: number, dimensions: { width: number, height: number }) {
    return y - ((dimensions.height - DEFAULT_GRAPH_HEIGHT) / 2)
}

/** Determines whether the node should be highlighted in the graph. */
function isNodeHighlighted(node: PublicationPersonNodeDatum, hoveredAuthorId: string | null, selectedAuthorId: string | null) {
    return !(hoveredAuthorId || selectedAuthorId) ||
        (node.person.id === hoveredAuthorId) ||
        (node.person.id === selectedAuthorId) ||
        (hoveredAuthorId && node.coauthorIds.has(hoveredAuthorId)) ||
        (selectedAuthorId && node.coauthorIds.has(selectedAuthorId))
}

function isNodeHoveredOrSelected(
    person: DblpPublicationPerson,
    hoveredAuthorId: string | null,
    selectedAuthorId: string | null
) {
    return (
        person.id === selectedAuthorId ||
        person.id === hoveredAuthorId)
}

/** Calculates minimal zoom scale of the graph.
 * If a user zooms out to this scale, whole graph is visible. */
function getMinZoomScale(computedNodes: PublicationPersonNodeDatum[], dimensions: { width: number; height: number }) {
    const rect = getGraphRect(computedNodes);
    // Graph area dimensions
    const width = Math.max(Math.abs(rect.left - DEFAULT_GRAPH_WIDTH), Math.abs(rect.right - DEFAULT_GRAPH_WIDTH)) * 2;
    const height = Math.max(Math.abs(rect.top - DEFAULT_GRAPH_HEIGHT), Math.abs(rect.bottom - DEFAULT_GRAPH_HEIGHT)) * 2;

    const min = Math.min(
        1,
        dimensions.width / width,
        dimensions.height / height
    );

    return min
}

/** Calculates the coordinates of the sides of the graph area. */
function getGraphRect(nodes: Array<PublicationPersonNodeDatum>) {
    let minX: number = Number.MAX_VALUE;
    let minY: number = Number.MAX_VALUE;
    let maxX: number = Number.MIN_VALUE;
    let maxY: number = Number.MIN_VALUE;

    for (const node of nodes) {
        if ((node.x || 0) < minX) {
            minX = node.x || 0
        }
        if ((node.y || 0) < minY) {
            minY = node.y || 0
        }
        if ((node.x || 0) > maxX) {
            maxX = node.x || 0
        }
        if ((node.y || 0) > maxY) {
            maxY = node.y || 0
        }
    }

    return {
        left: minX,
        top: minY,
        right: maxX,
        bottom: maxY
    } as EdgeRect
}

function mapComputedNodesAndLinks(
    event: MessageEvent<CoauthorsGraphWorkerResult>,
    filteredNodes: Array<PublicationPersonNodeDatum>,
    graph: CoauthorsGraphState
) {
    const eventNodes = event.data.nodes || [];
    const eventLinks = event.data.links || [];

    filteredNodes.forEach((node, index) => {
        node.x = eventNodes[index].x;
        node.y = eventNodes[index].y;
        node.index = eventNodes[index].index;
        node.fx = eventNodes[index].fx;
        node.fy = eventNodes[index].fy;
        node.vx = eventNodes[index].vx;
        node.vy = eventNodes[index].vy;
    });
    graph.links.forEach((link, index) => {
        link.index = eventLinks[index].index;
        link.source = getNode(eventLinks[index].source);
        link.target = getNode(eventLinks[index].target);
    });

    function getNode(computedNode: string | number | PublicationPersonNodeDatum) {
        return typeof computedNode === 'object' ?
            graph.authorsMap.get((computedNode as PublicationPersonNodeDatum).person.id) || computedNode :
            computedNode;
    }
}