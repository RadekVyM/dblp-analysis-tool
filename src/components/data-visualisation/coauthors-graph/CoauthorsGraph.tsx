'use client'

import { PublicationPersonNodeDatum } from '@/dtos/data-visualisation/graphs/PublicationPersonNodeDatum'
import { PublicationPersonLinkDatum } from '@/dtos/data-visualisation/graphs/PublicationPersonLinkDatum'
import * as d3 from 'd3'
import { MouseEvent, RefObject, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import LoadingWheel from '../../LoadingWheel'
import { cn } from '@/utils/tailwindUtils'
import { EdgeRect, PointRect } from '@/dtos/Rect'
import { CoauthorsGraphState } from '@/dtos/data-visualisation/graphs/CoauthorsGraph'
import { ZoomTransform } from '@/hooks/useZoom'
import { DataVisualisationCanvas, DataVisualisationCanvasRef } from '../DataVisualisationCanvas'
import { Inter } from 'next/font/google'
import { clamp } from '@/utils/numbers'
import { polygonArea, scaleToLength, triangleArea } from '@/utils/geometry'

const inter = Inter({ subsets: ['latin'] });

const DEFAULT_GRAPH_WIDTH = 400;
const DEFAULT_GRAPH_HEIGHT = 300;
const MAX_SCALE_EXTENT = 10;
const MIN_NODE_RADIUS = 1.2;
const MIN_LINK_THICKNESS = 0.35;

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

/** Graph of coauthors. */
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

    const zoomToCenter = useCallback(() => {
        graphRef.current?.zoomTo({ scale: zoomScaleExtent.min || 1, x: 0, y: 0 });
    }, [zoomScaleExtent.min]);

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

    return (
        <div
            className={cn(className, 'grid')}>
            {
                (computedNodes && computedNodes.length > 0) && computedLinks &&
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

        return runGraphSimulationInWorker(
            filteredNodes,
            graph.links,
            graph.authorsMap,
            (nodes, links) => {
                setComputedNodes(nodes);
                setComputedLinks(links);
            },
            (p) => setProgress(p));

        // An alternative approach to runGraphSimulationInWorker():
        /*
        runGraphSimulation(
            filteredNodes,
            graph.links,
            () => {
                setComputedNodes([...filteredNodes]);
                setComputedLinks([...graph.links]);
                setProgress(1);
            },
            (p) => setProgress(p));
        */
    }, [graph.nodes, graph.links, graph.authorsMap, ignoredNodeIds]);

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
    // Hovering a link does not change the graph state, so the link label is stored outside of it
    const [linkLabel, setLinkLabel] = useState<{ label: string, point: [number, number], linkIndex: number } | null>(null);
    const canvas = ref.current?.element;
    const simulation = useMemo(() => d3.forceSimulation(nodes).stop(), [nodes]);

    useEffect(() => {
        const context = canvas?.getContext('2d');
        const ratio = Math.ceil(window?.devicePixelRatio || 1);

        if (!context || nodes.length === 0) {
            return;
        }

        context.save();

        context.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);

        context.translate(zoomTransform.x * ratio, zoomTransform.y * ratio);
        context.scale(zoomTransform.scale * ratio, zoomTransform.scale * ratio);

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

        if (linkLabel && graph.showLinkWeightOnHover) {
            drawLinkLabel(
                context,
                dimensions,
                zoomTransform.scale,
                linkLabel.point,
                linkLabel.label);
        }

        context.restore();
    }, [canvas, zoomTransform, links, nodes, dimensions, graph, graph.showLinkWeightOnHover, linkLabel]);

    function onClick(event: MouseEvent) {
        const point = getGraphPoint(event);
        const node = findNode(point);

        if (node) {
            onNodeClick(node.person.id);
        }
    }

    function onPointerMove(event: MouseEvent) {
        const point = getGraphPoint(event);
        const node = findNode(point);

        if (!node) {
            const link = findLink(point);

            setLinkLabel(link && link.index !== undefined ?
                { point: point, label: link.publicationsCount.toString(), linkIndex: link.index } :
                null);
        }
        else {
            setLinkLabel(null);
        }

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
        setLinkLabel(null);
    }

    function findNode(point: [number, number]) {
        return simulation.find(point[0], point[1], 10);
    }

    function findLink(point: [number, number]) {
        for (const link of links) {
            if (link.isIgnored || link.isDim || (!link.isVisible && !graph.justDimInvisibleNodes)) {
                continue;
            }

            if (isPointOnLink(link, point)) {
                return link;
            }
        }
        return null;
    }

    function getGraphPoint(event: MouseEvent): [number, number] {
        const point = invertPoint(d3.pointer(event), zoomTransform);
        return [toDefaultX(point[0], dimensions), toDefaultY(point[1], dimensions)];
    }

    return {
        onCanvasClick: onClick,
        onCanvasPointerMove: onPointerMove,
        onCanvasPointerLeave: onPointerLeave,
    };
}

/** Draws a label at the specified point. */
function drawLinkLabel(
    context: CanvasRenderingContext2D,
    dimensions: { width: number; height: number },
    scale: number,
    point: [number, number],
    label: string
) {
    const computedStyle = getComputedStyle(context.canvas);
    const offset = -0.2;
    const x = toDimensionsX(point[0], dimensions) + offset;
    const y = toDimensionsY(point[1], dimensions) + offset;

    context.save();
    setDefaultLabelStyle(context, computedStyle, scale);
    context.textAlign = 'right';
    context.textBaseline = 'bottom';
    drawLabel(x, y, label, context);
    context.restore();
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
        node.canvasRadius = node.isHighlighted ? 10 : node.isDim ? 1.8 : 4;

        // If the graph is too large and zoomed out, nodes are too small to be visible
        // This ensures that nodes have a minimal size and are always visible
        if (node.canvasRadius * scale < MIN_NODE_RADIUS) {
            node.canvasRadius = (node.isDim ? MIN_NODE_RADIUS * 0.8 : MIN_NODE_RADIUS) / scale;
        }

        addNodeToPath(context, node, node.canvasRadius + 1.3);

        placeNodeToRightGroup(node, computedStyle, labeledNodes, coloredNodes, normalNodes, semitransparentNormalNodes);
    }

    context.closePath();
    context.save();
    context.shadowColor = computedStyle.getPropertyValue('--outline');
    context.shadowBlur = 5;
    context.fillStyle = computedStyle.getPropertyValue('--surface-container');
    context.fill();
    context.restore();

    drawNormalNodes(context, normalNodes, computedStyle);

    context.globalAlpha = 0.5;
    drawNormalNodes(context, semitransparentNormalNodes, computedStyle);
    context.globalAlpha = 1;

    drawColoredNodes(context, coloredNodes);

    drawNodeLabels(context, scale, labeledNodes, computedStyle);

    context.restore();
}

/** Places a node to the right collection of nodes. These collections can be then drawn separately. */
function placeNodeToRightGroup(
    node: PublicationPersonNodeDatum,
    computedStyle: CSSStyleDeclaration,
    labeledNodes: Array<PublicationPersonNodeDatum>,
    coloredNodes: Map<string, Array<PublicationPersonNodeDatum>>,
    normalNodes: Array<PublicationPersonNodeDatum>,
    semitransparentNormalNodes: Array<PublicationPersonNodeDatum>
) {
    const color = getColor(node, computedStyle);

    if (node.isLabelVisible) {
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
    nodes: Array<PublicationPersonNodeDatum>,
    computedStyle: CSSStyleDeclaration
) {
    setDefaultLabelStyle(context, computedStyle, scale);

    const highlightedNodes: Array<PublicationPersonNodeDatum> = [];

    for (const node of nodes) {
        if (node.isHighlighted) {
            highlightedNodes.push(node);
            continue;
        }

        drawNodeLabel(node, context);
    }

    context.fillStyle = computedStyle.getPropertyValue('--primary');
    context.font = `bold ${15 / scale}px ${inter.style.fontFamily}`;

    for (const node of highlightedNodes) {
        drawNodeLabel(node, context);
    }
}

function drawNodeLabel(node: PublicationPersonNodeDatum, context: CanvasRenderingContext2D) {
    drawLabel(node.canvasX, node.canvasY, node.person.name, context);
}

function drawLabel(x: number, y: number, label: string, context: CanvasRenderingContext2D) {
    context.moveTo(x, y);
    context.strokeText(label, x, y);
    context.fillText(label, x, y);
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

        if (link.isIgnored || (!justDimInvisibleNodes && !link.isVisible)) {
            continue;
        }

        drawLine(source, target, link.intensity, defaultColor, context, zoomTransform, link.isHighlighted, link.isDim, dimensions);
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
    dimensions: { width: number; height: number }
) {
    if (source.x && source.y && target.x && target.y) {
        context.globalAlpha = isDim ? 0.09 : isHighlighted ? (0.8 + 0.2 * intensity) : (0.3 + 0.7 * intensity);
        context.strokeStyle = color;
        context.lineWidth = ((isHighlighted ? 1 : 0.8) + 0.3 * intensity) / clamp(zoomTransform.scale * 0.9, 0.9, 1.1);

        // If the graph is too large and zoomed out, links are too small to be visible
        // This ensures that links have a minimal width and are always visible
        if (context.lineWidth * zoomTransform.scale < MIN_LINK_THICKNESS) {
            context.lineWidth = MIN_LINK_THICKNESS / zoomTransform.scale;
        }

        context.beginPath();
        context.moveTo(toDimensionsX(source.x, dimensions), toDimensionsY(source.y, dimensions));
        context.lineTo(toDimensionsX(target.x, dimensions), toDimensionsY(target.y, dimensions));
        context.stroke();
        context.closePath();
    }
}

/** Sets default styling for drawing a label on canvas. */
function setDefaultLabelStyle(context: CanvasRenderingContext2D, computedStyle: CSSStyleDeclaration, scale: number) {
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeStyle = computedStyle.getPropertyValue('--surface');
    context.fillStyle = computedStyle.getPropertyValue('--on-surface');
    context.lineWidth = 4 / scale;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.font = `bold ${13 / scale}px ${inter.style.fontFamily}`;
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

function isPointOnLink(link: PublicationPersonLinkDatum, point: [number, number]) {
    if (typeof link.source !== 'object' || typeof link.target !== 'object') {
        // The simulation is not finished yet 
        return false;
    }

    const source = link.source as PublicationPersonNodeDatum;
    const target = link.target as PublicationPersonNodeDatum;
    const rect = getLinkRect(source, target);

    if (!rect) {
        return false;
    }

    const sumOfTriangles =
        triangleArea(point, rect.a, rect.b) +
        triangleArea(point, rect.b, rect.c) +
        triangleArea(point, rect.c, rect.d) +
        triangleArea(point, rect.d, rect.a);
    const rectA = polygonArea(rect);

    return sumOfTriangles - rectA < 1;
}

function getLinkRect(source: PublicationPersonNodeDatum, target: PublicationPersonNodeDatum) {
    if (target.x === undefined || source.x === undefined || target.y === undefined || source.y === undefined) {
        return null;
    }

    const thickness = 2;
    const vector: [number, number] = [target.x - source.x, target.y - source.y];
    const up: [number, number] = scaleToLength([vector[1], -vector[0]], thickness / 2);
    const down: [number, number] = scaleToLength([-vector[1], vector[0]], thickness / 2);

    return {
        a: [target.x + up[0], target.y + up[1]],
        b: [target.x + down[0], target.y + down[1]],
        c: [source.x + down[0], source.y + down[1]],
        d: [source.x + up[0], source.y + up[1]],
    } as PointRect;
}

/** Extracts a color of a node if it exists. */
function getColor(node: PublicationPersonNodeDatum, computedStyle: CSSStyleDeclaration) {
    return node.color || (node.colorCssProperty && computedStyle.getPropertyValue(node.colorCssProperty));
}

/** Runs the graph simulation using requestAnimationFrame(). */
function runGraphSimulation(
    filteredNodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    onFinished: () => void,
    onProgress: (progress: number) => void) {
    if (filteredNodes.length === 0) {
        onFinished();
        return;
    }

    const simulation = d3.forceSimulation<PublicationPersonNodeDatum>(filteredNodes)
        .force('link', d3.forceLink<PublicationPersonNodeDatum, PublicationPersonLinkDatum>()
            .id((d) => d.person.id)
            .links(links))
        .force('charge', d3.forceManyBody().strength(-50))
        .force('center', d3.forceCenter(DEFAULT_GRAPH_WIDTH / 2, DEFAULT_GRAPH_HEIGHT / 2))
        .stop();

    const n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
    let i = n;

    requestAnimationFrame(tick);

    function tick() {
        if (i === 0) {
            onFinished();
            return;
        }

        // When the graph is large, more ticks per request lead to laggy browser
        // On the other hand, more ticks per request lead to faster generation of the graph
        const ticksCountPerRequest = filteredNodes.length < 1000 ? 3 : 1;

        i -= ticksCountPerRequest;
        onProgress((n - i) / n);
        for (let j = 0; j < ticksCountPerRequest; j++) {
            simulation.tick();
        }
        requestAnimationFrame(tick);
    }
}

/** Runs the graph simulation using web worker. */
function runGraphSimulationInWorker(
    filteredNodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    onFinished: (nodes: Array<PublicationPersonNodeDatum>, links: Array<PublicationPersonLinkDatum>) => void,
    onProgress: (progress: number) => void,
): () => void {
    const graphWorker = new Worker(new URL('./graphSimulationWorker.js', import.meta.url));

    // Listen to the events generated by the simulation
    graphWorker.onmessage = (event: MessageEvent<CoauthorsGraphWorkerResult>) => {
        switch (event.data.type) {
            case 'tick':
                onProgress(event.data.progress || 0);
                break;
            case 'end':
                // Different instances are sent back from the web worker
                // I need to map their computed values to my instances
                mapComputedNodesAndLinks(event, filteredNodes, links, authorsMap);
                onFinished([...filteredNodes], [...links]);
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
        links: links,
        graphWidth: DEFAULT_GRAPH_WIDTH,
        graphHeight: DEFAULT_GRAPH_HEIGHT
    } as CoauthorsGraphWorkerData);

    return () => graphWorker.terminate();
}

function mapComputedNodesAndLinks(
    event: MessageEvent<CoauthorsGraphWorkerResult>,
    filteredNodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    authorsMap: Map<string, PublicationPersonNodeDatum>
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
    links.forEach((link, index) => {
        link.index = eventLinks[index].index;
        link.source = getNode(eventLinks[index].source);
        link.target = getNode(eventLinks[index].target);
    });

    function getNode(computedNode: string | number | PublicationPersonNodeDatum) {
        return typeof computedNode === 'object' ?
            authorsMap.get((computedNode as PublicationPersonNodeDatum).person.id) || computedNode :
            computedNode;
    }
}