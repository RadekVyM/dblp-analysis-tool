'use client'

import { PublicationPersonNodeDatum } from '@/dtos/PublicationPersonNodeDatum'
import { DataVisualisationSvg, ZoomScaleExtent, ZoomTransform } from './DataVisualisationSvg'
import { PublicationPersonLinkDatum } from '@/dtos/PublicationPersonLinkDatum'
import * as d3 from 'd3'
import { RefObject, useEffect, useRef, useState } from 'react'
import ZoomContainer from './ZoomContainer'
import LoadingWheel from '../LoadingWheel'
import { cn } from '@/utils/tailwindUtils'
import { Rect } from '@/dtos/Rect'
import { DblpPublicationPerson } from '@/dtos/DblpPublication'
import { useHover } from 'usehooks-ts'
import OutlinedText from './OutlinedText'
import { createPortal } from 'react-dom'

const DEFAULT_GRAPH_WIDTH = 400;
const DEFAULT_GRAPH_HEIGHT = 300;
const MAX_SCALE_EXTENT = 10;

type CoauthorsGraphParams = {
    nodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    onAuthorClick: (id: string) => void,
    selectedAuthorId: string | null,
    ignoredNodeIds?: Array<string>,
    ignoredLinksNodeIds?: Array<string>,
    className?: string
}

type LinksCanvasParams = {
    zoomTransform: ZoomTransform,
    links: Array<PublicationPersonLinkDatum>,
    dimensions: { width: number, height: number },
    ignoredNodeIds?: Array<string>
}

type NodeParams = {
    person: DblpPublicationPerson,
    colorClass?: string,
    color?: string,
    x: number,
    y: number,
    labelsContainerRef: RefObject<SVGGElement | null>,
    zoomScale: number,
    isSelected: boolean,
    onClick: () => void
}

export default function CoauthorsGraph({ nodes, links, ignoredNodeIds, ignoredLinksNodeIds, className, selectedAuthorId, onAuthorClick }: CoauthorsGraphParams) {
    const [computedNodes, setComputedNodes] = useState<Array<PublicationPersonNodeDatum>>([]);
    const [computedLinks, setComputedLinks] = useState<Array<PublicationPersonLinkDatum>>([]);
    const [zoomTransform, setZoomTransform] = useState<ZoomTransform>({ scale: 1, x: 0, y: 0 });
    const [zoomScaleExtent, setZoomScaleExtent] = useState<ZoomScaleExtent>({ min: 1, max: MAX_SCALE_EXTENT });
    const [dimensions, setDimensions] = useState<{ width: number, height: number } | null>(null);
    const labelsContainerRef = useRef<SVGGElement | null>(null);

    useEffect(() => {
        const filteredNodes = (ignoredNodeIds?.length || 0) > 0 ?
            nodes.filter((n) => !ignoredNodeIds?.some(id => n.person.id === id)) :
            nodes;

        const simulation = d3.forceSimulation<PublicationPersonNodeDatum>(filteredNodes)
            .force('link', d3.forceLink<PublicationPersonNodeDatum, PublicationPersonLinkDatum>()
                .id((d) => d.person.id)
                .links(links))
            .force('charge', d3.forceManyBody().strength(-50))
            .force('center', d3.forceCenter(DEFAULT_GRAPH_WIDTH / 2, DEFAULT_GRAPH_HEIGHT / 2))
            .on('end', ended)
            .on('tick', ticked);

        return () => { simulation.stop() }
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

        console.log(min)

        setZoomScaleExtent({
            min: min,
            max: MAX_SCALE_EXTENT
        });
    }, [dimensions, computedNodes]);

    function ticked() {
    }

    function ended() {
        setComputedNodes([...nodes]);
        setComputedLinks([...links]);
    }

    return (
        <div
            className={cn(className, 'grid')}>
            <DataVisualisationSvg
                className='w-full h-full row-start-1 row-end-2 col-start-1 col-end-2'
                zoomScaleExtent={zoomScaleExtent}
                onZoomChange={(transform) => setZoomTransform(transform)}
                onDimensionsChange={(width, height) => setDimensions({ width, height })}
                before={
                    dimensions &&
                    <LinksCanvas
                        links={computedLinks}
                        zoomTransform={zoomTransform}
                        dimensions={dimensions}
                        ignoredNodeIds={ignoredLinksNodeIds} />
                }>
                {
                    (computedNodes && computedNodes.length > 0) &&
                    <>
                        <ZoomContainer
                            zoomTransform={zoomTransform}>
                            {dimensions && computedNodes.map((n, i) =>
                                <Node
                                    key={n.person.id}
                                    x={accountDimensionsX((n.x || 0), dimensions)}
                                    y={accountDimensionsY((n.y || 0), dimensions)}
                                    color={n.color}
                                    colorClass={n.colorClass}
                                    labelsContainerRef={labelsContainerRef}
                                    zoomScale={zoomTransform.scale}
                                    person={n.person}
                                    isSelected={n.person.id === selectedAuthorId}
                                    onClick={() => onAuthorClick(n.person.id)} />)}
                        </ZoomContainer>
                        <g
                            ref={labelsContainerRef}
                            transform={`translate(${zoomTransform.x}, ${zoomTransform.y})`} />
                    </>
                }
            </DataVisualisationSvg>
            {
                !(computedNodes && computedNodes.length > 0) &&
                <LoadingWheel
                    className='place-self-center row-start-1 row-end-2 col-start-1 col-end-2 w-10 h-10 text-on-surface-container-muted' />
            }
        </div>
    )
}

function Node({ x, y, person, color, colorClass, labelsContainerRef, zoomScale, isSelected, onClick: onNodeClick }: NodeParams) {
    const ref = useRef(null);
    const isHovered = useHover(ref);

    return (
        <g
            onClick={() => onNodeClick()}>
            <circle
                ref={ref}
                className={cn('z-0 fill-on-surface-container', colorClass)}
                fill={color}
                cx={x}
                cy={y}
                r={isHovered ? 10 : 5} />
            {(isSelected || isHovered) && labelsContainerRef.current &&
                createPortal(
                    <OutlinedText
                        className='pointer-events-none'
                        textAnchor='middle'
                        alignmentBaseline='middle'
                        x={x * zoomScale}
                        y={y * zoomScale}>
                        {person.name}
                    </OutlinedText>, labelsContainerRef.current)}
        </g>
    )
}

function LinksCanvas({ zoomTransform, links, ignoredNodeIds, dimensions }: LinksCanvasParams) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const context = ref.current?.getContext('2d');

        if (!context || links.length === 0) {
            return
        }

        context.save();

        context.clearRect(0, 0, ref.current?.width || 0, ref.current?.height || 0);

        context.translate(zoomTransform.x, zoomTransform.y);
        context.scale(zoomTransform.scale, zoomTransform.scale);

        for (const link of links) {
            if (typeof link.source !== 'object' || typeof link.target !== 'object') {
                // The simulation is not finished yet 
                continue
            }

            const source = link.source as PublicationPersonNodeDatum;
            const target = link.target as PublicationPersonNodeDatum;

            if (ignoredNodeIds?.some((id) => source.person.id === id || target.person.id === id)) {
                continue
            }

            drawLine(source, target, context, zoomTransform, dimensions);
        }

        context.restore();
    }, [zoomTransform, links, dimensions]);

    return (
        <canvas
            ref={ref}
            width={dimensions.width}
            height={dimensions.height}
            className='absolute inset-0 h-full w-full -z-10' />
    )
}

function drawLine(
    source: PublicationPersonNodeDatum,
    target: PublicationPersonNodeDatum,
    context: CanvasRenderingContext2D,
    zoomTransform: ZoomTransform,
    dimensions: { width: number; height: number }) {
    if (source.x && source.y && target.x && target.y) {
        context.save()

        context.strokeStyle = 'gray'
        context.lineWidth = Math.max(0.5, 1 / (Math.max(1, zoomTransform.scale)))

        context.beginPath()
        context.moveTo(accountDimensionsX(source.x, dimensions), accountDimensionsY(source.y, dimensions))
        context.lineTo(accountDimensionsX(target.x, dimensions), accountDimensionsY(target.y, dimensions))
        context.stroke()

        context.restore()
    }
}

function accountDimensionsX(x: number, dimensions: { width: number, height: number }) {
    return x + ((dimensions.width - DEFAULT_GRAPH_WIDTH) / 2)
}

function accountDimensionsY(y: number, dimensions: { width: number, height: number }) {
    return y + ((dimensions.height - DEFAULT_GRAPH_HEIGHT) / 2)
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