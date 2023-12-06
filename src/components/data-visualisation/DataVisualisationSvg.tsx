'use client'

import { RefObject, forwardRef, useEffect, useRef, useImperativeHandle, useState } from 'react'
import { cn } from '@/utils/tailwindUtils'
import * as d3 from 'd3'
import useDimensions from '@/hooks/useDimensions'

export type ZoomTransform = { scale: number, x: number, y: number }

export type ZoomScaleExtent = { min?: number, max?: number }

type OnZoomChangeCallback = (param: ZoomTransform) => void

type DataVisualisationSvgParams = {
    children: React.ReactNode,
    className?: string,
    before?: React.ReactNode,
    after?: React.ReactNode,
    innerClassName?: string,
    zoomScaleExtent?: ZoomScaleExtent,
    onDimensionsChange?: (width: number, height: number) => void,
    onZoomChange?: OnZoomChangeCallback,
}

export const DataVisualisationSvg = forwardRef<SVGSVGElement, DataVisualisationSvgParams>(({
    children,
    before,
    after,
    zoomScaleExtent,
    onDimensionsChange,
    onZoomChange,
    className,
    innerClassName },
    ref) => {
    const innerRef = useRef<SVGSVGElement>(null);
    const outerRef = useRef<HTMLDivElement>(null);
    // ResizeObserver does not work on SVG elements. The outer div reference has to be used
    const dimensions = useDimensions(outerRef);

    useZoom(dimensions, innerRef, zoomScaleExtent, onZoomChange);

    useImperativeHandle(ref, () => innerRef.current!);

    useEffect(() => {
        if (dimensions && onDimensionsChange) {
            onDimensionsChange(dimensions.width, dimensions.height);
        }
    }, [dimensions]);

    return (
        <div
            ref={outerRef}
            className={cn('relative isolate w-full h-full overflow-x-auto', className)}>
            {before}
            <svg
                ref={innerRef}
                width={dimensions.width} height={dimensions.height}
                className={cn('w-full h-full', innerClassName)}
                role='img'>
                {children}
            </svg>
            {after}
        </div>
    )
});

DataVisualisationSvg.displayName = 'DataVisualisationSvg';

function useZoom(
    dimensions: { width: number, height: number },
    svgRef: RefObject<SVGSVGElement | null>,
    scaleExtent?: ZoomScaleExtent,
    onZoomChange?: OnZoomChangeCallback) {
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    useEffect(() => {
        if (!svgRef.current || !onZoomChange) {
            return;
        }

        const svg = d3.select(svgRef.current);

        const currentZoom = (zoomRef.current || d3.zoom<SVGSVGElement, unknown>())
            .extent([[0, 0], [dimensions.width, dimensions.height]])
            .scaleExtent([scaleExtent?.min || 1, scaleExtent?.max || 2])
            .on('zoom', (event) => {
                const transform = event.transform as { k: number, x: number, y: number };

                if (onZoomChange) {
                    onZoomChange({ scale: transform.k, x: transform.x, y: transform.y })
                }
            });

        zoomRef.current = currentZoom;

        svg.call(currentZoom);
    }, [dimensions, svgRef, scaleExtent]);
}