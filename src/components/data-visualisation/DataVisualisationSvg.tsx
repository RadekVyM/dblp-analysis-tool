'use client'

import { forwardRef, useEffect, useRef, useImperativeHandle, CSSProperties } from 'react'
import { cn } from '@/utils/tailwindUtils'
import useDimensions from '@/hooks/useDimensions'
import useZoom, { OnZoomChangeCallback, ZoomScaleExtent, ZoomTransform } from '@/hooks/useZoom'

type DataVisualisationSvgParams = {
    children: React.ReactNode,
    className?: string,
    style?: CSSProperties,
    before?: React.ReactNode,
    after?: React.ReactNode,
    innerClassName?: string,
    zoomScaleExtent?: ZoomScaleExtent,
    onDimensionsChange?: (width: number, height: number) => void,
    onZoomChange?: OnZoomChangeCallback,
}

export type DataVisualisationSvgRef = {
    element: SVGSVGElement,
    zoomTo: (zoomTransform: ZoomTransform) => void
}

/** SVG element that can be zoomable. */
export const DataVisualisationSvg = forwardRef<DataVisualisationSvgRef, DataVisualisationSvgParams>(({
    children,
    before,
    after,
    zoomScaleExtent,
    onDimensionsChange,
    onZoomChange,
    className,
    style,
    innerClassName },
    ref) => {
    const innerRef = useRef<SVGSVGElement>(null);
    const outerRef = useRef<HTMLDivElement>(null);
    // ResizeObserver does not work on SVG elements. The outer div reference has to be used
    const dimensions = useDimensions(outerRef);
    const { zoomTo } = useZoom(dimensions, innerRef, zoomScaleExtent, onZoomChange);

    useImperativeHandle(ref, () => ({
        element: innerRef.current!,
        zoomTo
    }), [innerRef.current, zoomTo]);

    useEffect(() => {
        if (dimensions && onDimensionsChange) {
            onDimensionsChange(dimensions.width, dimensions.height);
        }
    }, [dimensions]);

    return (
        <div
            ref={outerRef}
            style={style}
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