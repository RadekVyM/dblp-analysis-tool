'use client'

import { forwardRef, useEffect, useRef, useImperativeHandle, CSSProperties, PointerEventHandler } from 'react'
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
    onPointerMove?: PointerEventHandler<HTMLDivElement>,
    onPointerLeave?: PointerEventHandler<HTMLDivElement>
}

export type DataVisualisationSvgRef = {
    element: SVGSVGElement,
    zoomTo: (zoomTransform: ZoomTransform) => void
}

/**
 * SVG element that can be zoomable.
 * width and height attributes of this SVG element are automatically adjusted to the required element dimensions.
 */
export const DataVisualisationSvg = forwardRef<DataVisualisationSvgRef, DataVisualisationSvgParams>(({
    children,
    before,
    after,
    zoomScaleExtent,
    onDimensionsChange,
    onZoomChange,
    onPointerMove,
    onPointerLeave,
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
    }), [zoomTo]);

    useEffect(() => {
        if (dimensions && onDimensionsChange) {
            onDimensionsChange(dimensions.width, dimensions.height);
        }
        // onDimensionsChange should not trigger this effect
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dimensions]);

    return (
        <div
            ref={outerRef}
            style={style}
            className={cn('relative isolate w-full h-full overflow-x-auto', className)}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}>
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