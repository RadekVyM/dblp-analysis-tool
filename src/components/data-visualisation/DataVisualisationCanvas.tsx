'use client'

import { forwardRef, useEffect, useRef, useImperativeHandle, DOMAttributes } from 'react'
import { cn } from '@/utils/tailwindUtils'
import useDimensions from '@/hooks/useDimensions'
import useZoom, { OnZoomChangeCallback, ZoomScaleExtent, ZoomTransform } from '@/hooks/useZoom'

type DataVisualisationCanvasParams = {
    className?: string,
    before?: React.ReactNode,
    after?: React.ReactNode,
    innerClassName?: string,
    zoomScaleExtent?: ZoomScaleExtent,
    onDimensionsChange?: (width: number, height: number) => void,
    onZoomChange?: OnZoomChangeCallback,
} & DOMAttributes<HTMLCanvasElement>

export type DataVisualisationCanvasRef = {
    element: HTMLCanvasElement,
    zoomTo: (zoomTransform: ZoomTransform) => void
}

/** Canvas element that can be zoomable. */
export const DataVisualisationCanvas = forwardRef<DataVisualisationCanvasRef, DataVisualisationCanvasParams>(({
    children,
    before,
    after,
    zoomScaleExtent,
    onDimensionsChange,
    onZoomChange,
    className,
    innerClassName,
    ...rest },
    ref) => {
    const innerRef = useRef<HTMLCanvasElement | null>(null);
    const outerRef = useRef<HTMLDivElement>(null);
    const dimensions = useDimensions(outerRef);
    const ratio = Math.ceil(window?.devicePixelRatio || 1);
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
            className={cn('relative isolate w-full h-full overflow-x-auto', className)}>
            {before}
            <canvas
                {...rest}
                ref={innerRef}
                width={dimensions.width * ratio} height={dimensions.height * ratio}
                className={cn('w-full h-full', innerClassName)}
                role='img'>
            </canvas>
            {after}
        </div>
    )
});

DataVisualisationCanvas.displayName = 'DataVisualisationCanvas';