'use client'

import { PublicationPersonNodeDatum } from '@/dtos/PublicationPersonNodeDatum'
import { PublicationPersonLinkDatum } from '@/dtos/PublicationPersonLinkDatum'
import * as d3 from 'd3'
import { MouseEvent, RefObject, useEffect, useMemo, useRef, useState } from 'react'
import LoadingWheel from '../../LoadingWheel'
import { cn } from '@/utils/tailwindUtils'
import { Rect } from '@/dtos/Rect'
import { GraphOptions } from '@/dtos/GraphOptions'
import { ZoomScaleExtent, ZoomTransform } from '@/hooks/useZoom'
import { DataVisualisationCanvas, DataVisualisationCanvasRef } from '../DataVisualisationCanvas'

const DEFAULT_GRAPH_WIDTH = 400;
const DEFAULT_GRAPH_HEIGHT = 300;
const MAX_SCALE_EXTENT = 10;

type CoauthorsGraphParams = {
    nodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    onAuthorClick: (id: string) => void,
    onHoverChange: (id: string, isHovered: boolean) => void,
    selectedAuthorId: string | null,
    hoveredAuthorId: string | null,
    minCoauthoredPublicationsCount: number,
    maxCoauthoredPublicationsCount: number,
    options: GraphOptions,
    ignoredNodeIds?: Array<string>,
    ignoredLinksNodeIds?: Array<string>,
    className?: string
}

export type CoauthorsGraphWorkerData = {
    nodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    graphWidth: number,
    graphHeight: number,
    ignoredNodeIds?: Array<string>
}

export type CoauthorsGraphWorkerResult = {
    type: 'end' | 'tick'
} & Partial<{
    nodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    progress: number
}>

export default function CoauthorsGraph({
    nodes,
    links,
    ignoredNodeIds,
    ignoredLinksNodeIds,
    className,
    selectedAuthorId,
    hoveredAuthorId,
    minCoauthoredPublicationsCount,
    maxCoauthoredPublicationsCount,
    options,
    onAuthorClick,
    onHoverChange
}: CoauthorsGraphParams) {
    const graphRef = useRef<DataVisualisationCanvasRef | null>(null);
    const [computedNodes, setComputedNodes] = useState<Array<PublicationPersonNodeDatum>>([]);
    const [computedLinks, setComputedLinks] = useState<Array<PublicationPersonLinkDatum>>([]);
    const [zoomTransform, setZoomTransform] = useState<ZoomTransform>({ scale: 1, x: 0, y: 0 });
    const [zoomScaleExtent, setZoomScaleExtent] = useState<ZoomScaleExtent>({ min: 1, max: MAX_SCALE_EXTENT });
    const [dimensions, setDimensions] = useState<{ width: number, height: number } | null>(null);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        setComputedNodes([]);
        setComputedLinks([]);
        setProgress(0);

        const graphWorker = new Worker(new URL('./graphSimulationWorker', import.meta.url));

        graphWorker.onmessage = (event: MessageEvent<CoauthorsGraphWorkerResult>) => {
            switch (event.data.type) {
                case 'tick':
                    setProgress(event.data.progress || 0);
                    break;
                case 'end':
                    setComputedNodes([...(event.data.nodes || [])]);
                    setComputedLinks([...(event.data.links || [])]);
                    break;
            }
        };

        graphWorker.onerror = (event) => {
            if (event instanceof Event) {
                return event
            }
        };

        graphWorker.postMessage({
            nodes: nodes,
            links: links,
            ignoredNodeIds: ignoredLinksNodeIds,
            graphWidth: DEFAULT_GRAPH_WIDTH,
            graphHeight: DEFAULT_GRAPH_HEIGHT
        } as CoauthorsGraphWorkerData);

        return () => { graphWorker.terminate() }
    }, [nodes, links, ignoredNodeIds]);

    useEffect(() => {
        if (!dimensions || dimensions.width == 0 || dimensions.height == 0 || computedNodes.length <= 0) {
            return
        }

        const rect = getGraphRect(computedNodes);
        const min = Math.min(
            1,
            dimensions.width / rect.width,
            dimensions.height / rect.height
        );

        setZoomScaleExtent({
            min: min,
            max: MAX_SCALE_EXTENT
        });
    }, [dimensions, computedNodes]);

    useEffect(() => {
        graphRef.current?.zoomTo({ scale: zoomScaleExtent.min || 1, x: 0, y: 0 });
    }, [graphRef.current, zoomScaleExtent]);

    const { onCanvasClick, onCanvasPointerMove } = useCanvas(
        graphRef,
        zoomTransform,
        computedLinks,
        computedNodes,
        dimensions || { width: 0, height: 0 },
        maxCoauthoredPublicationsCount,
        minCoauthoredPublicationsCount,
        hoveredAuthorId,
        selectedAuthorId,
        options,
        onAuthorClick,
        onHoverChange,
        ignoredNodeIds);

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
                    onPointerMove={onCanvasPointerMove}>
                </DataVisualisationCanvas>
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
}

function useCanvas(
    ref: RefObject<DataVisualisationCanvasRef | null>,
    zoomTransform: ZoomTransform,
    links: Array<PublicationPersonLinkDatum>,
    nodes: Array<PublicationPersonNodeDatum>,
    dimensions: { width: number, height: number },
    minCoauthoredPublicationsCount: number,
    maxCoauthoredPublicationsCount: number,
    hoveredAuthorId: string | null,
    selectedAuthorId: string | null,
    options: GraphOptions,
    onNodeClick: (id: string) => void,
    onNodeHoverChange: (id: string, isHovered: boolean) => void,
    ignoredNodeIds?: Array<string>,
) {
    const canvas = ref.current?.element;
    const simulation = useMemo(() => d3.forceSimulation(nodes).stop(), [nodes]);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useEffect(() => {
        const context = canvas?.getContext('2d');

        if (!context || links.length === 0) {
            return
        }

        context.save();

        context.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);

        context.translate(zoomTransform.x, zoomTransform.y);
        context.scale(zoomTransform.scale, zoomTransform.scale);

        // TODO: options does not work
        drawLines(links, ignoredNodeIds, minCoauthoredPublicationsCount, maxCoauthoredPublicationsCount, context, zoomTransform, dimensions);
        // TODO: Labels, colors, semitransparency...
        drawNodes(nodes, dimensions, context, selectedAuthorId, hoveredAuthorId, hoveredId);

        context.restore();
    }, [options, zoomTransform, links, nodes, dimensions, ignoredNodeIds, selectedAuthorId, hoveredAuthorId, hoveredId]);

    function onClick(event: MouseEvent) {
        const node = findNode(event);

        if (node) {
            onNodeClick(node.person.id);
        }
    }

    function onPointerMove(event: MouseEvent) {
        const node = findNode(event);

        if (hoveredId) {
            onNodeHoverChange(hoveredId, false);
        }

        if (node) {
            onNodeHoverChange(node.person.id, true);
            setHoveredId(node.person.id);
        }
        else {
            setHoveredId(null);
        }
    }

    function findNode(event: MouseEvent) {
        const point = invertPoint(d3.pointer(event), zoomTransform);
        return simulation.find(toDefaultX(point[0], dimensions), toDefaultY(point[1], dimensions), 10);
    }

    return {
        onCanvasClick: onClick,
        onCanvasPointerMove: onPointerMove
    }
}

function drawNodes(
    nodes: Array<PublicationPersonNodeDatum>,
    dimensions: { width: number; height: number },
    context: CanvasRenderingContext2D,
    selectedAuthorId: string | null,
    outerHoveredAuthorId: string | null,
    hoveredAuthorId: string | null
) {
    context.save();

    for (const node of nodes) {
        if (!node.x || !node.y) {
            continue
        }

        const x = toDimensionsX(node.x, dimensions);
        const y = toDimensionsY(node.y, dimensions);

        const isSelected = node.person.id === selectedAuthorId;
        const isDim = !isHighlighted(node, hoveredAuthorId, selectedAuthorId);
        const isOuterHovered = node.person.id === outerHoveredAuthorId;
        const isHovered = node.person.id === hoveredAuthorId;

        context.moveTo(x, y);
        context.arc(x, y, isDim ? 1.5 : (isSelected || isHovered || isOuterHovered) ? 10 : 4, 0, 2 * Math.PI);
    }
    context.fillStyle = 'black';
    context.fill();

    context.restore();
}

function drawLines(links: PublicationPersonLinkDatum[], ignoredNodeIds: string[] | undefined, minCoauthoredPublicationsCount: number, maxCoauthoredPublicationsCount: number, context: CanvasRenderingContext2D, zoomTransform: ZoomTransform, dimensions: { width: number; height: number }) {
    for (const link of links) {
        if (typeof link.source !== 'object' || typeof link.target !== 'object') {
            // The simulation is not finished yet 
            continue
        }

        const source = link.source as PublicationPersonNodeDatum
        const target = link.target as PublicationPersonNodeDatum

        if (ignoredNodeIds?.some((id) => source.person.id === id || target.person.id === id)) {
            continue
        }

        const intensity = (link.publicationsCount - minCoauthoredPublicationsCount) /
            (maxCoauthoredPublicationsCount - minCoauthoredPublicationsCount)

        drawLine(source, target, intensity, context, zoomTransform, dimensions)
    }
}

function drawLine(
    source: PublicationPersonNodeDatum,
    target: PublicationPersonNodeDatum,
    intensity: number,
    context: CanvasRenderingContext2D,
    zoomTransform: ZoomTransform,
    dimensions: { width: number; height: number }) {
    if (source.x && source.y && target.x && target.y) {
        context.save()

        context.strokeStyle = `rgba(155, 155, 155, ${0.7 + 0.3 * intensity})`
        context.lineWidth = Math.max(0.5, 1 / (Math.max(1, zoomTransform.scale)))

        context.beginPath()
        context.moveTo(toDimensionsX(source.x, dimensions), toDimensionsY(source.y, dimensions))
        context.lineTo(toDimensionsX(target.x, dimensions), toDimensionsY(target.y, dimensions))
        context.stroke()

        context.restore()
    }
}

function invertPoint(point: [number, number], zoomTransform: ZoomTransform) {
    const t = d3.zoomIdentity
        .translate(zoomTransform.x, zoomTransform.y)
        .scale(zoomTransform.scale);

    return t.invert(point)
}

function toDimensionsX(x: number, dimensions: { width: number, height: number }) {
    return x + ((dimensions.width - DEFAULT_GRAPH_WIDTH) / 2)
}

function toDimensionsY(y: number, dimensions: { width: number, height: number }) {
    return y + ((dimensions.height - DEFAULT_GRAPH_HEIGHT) / 2)
}

function toDefaultX(x: number, dimensions: { width: number, height: number }) {
    return x - ((dimensions.width - DEFAULT_GRAPH_WIDTH) / 2)
}

function toDefaultY(y: number, dimensions: { width: number, height: number }) {
    return y - ((dimensions.height - DEFAULT_GRAPH_HEIGHT) / 2)
}

function isHighlighted(n: PublicationPersonNodeDatum, hoveredAuthorId: string | null, selectedAuthorId: string | null) {
    return !(hoveredAuthorId || selectedAuthorId) ||
        (n.person.id === hoveredAuthorId) ||
        (n.person.id === selectedAuthorId) ||
        (hoveredAuthorId && n.coauthorIds.has(hoveredAuthorId)) ||
        (selectedAuthorId && n.coauthorIds.has(selectedAuthorId))
}

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
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    } as Rect
}