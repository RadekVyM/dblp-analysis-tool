'use client'

import { RefObject, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'

export type ZoomTransform = { scale: number, x: number, y: number }

export type ZoomScaleExtent = { min?: number, max?: number }

export type OnZoomChangeCallback = (param: ZoomTransform) => void

export default function useZoom(
    dimensions: { width: number, height: number },
    elementRef: RefObject<Element | null>,
    scaleExtent?: ZoomScaleExtent,
    onZoomChange?: OnZoomChangeCallback) {
    const zoomRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);

    useEffect(() => {
        if (!elementRef.current || !onZoomChange) {
            return;
        }

        const element = d3.select(elementRef.current);

        const currentZoom = (zoomRef.current || d3.zoom<Element, unknown>())
            .extent([[0, 0], [dimensions.width, dimensions.height]])
            .scaleExtent([scaleExtent?.min || 1, scaleExtent?.max || 2])
            .on('zoom', (event) => {
                const transform = event.transform as { k: number, x: number, y: number };

                if (onZoomChange) {
                    onZoomChange({ scale: transform.k, x: transform.x, y: transform.y })
                }
            });

        zoomRef.current = currentZoom;

        element.call(currentZoom);
    }, [dimensions, elementRef, scaleExtent]);

    function zoomTo(zoomTransform: ZoomTransform) {
        if (!zoomRef.current || !elementRef.current) {
            return
        }

        const element = d3.select(elementRef.current);

        const width = elementRef.current.clientWidth / 2;
        const height = elementRef.current.clientHeight / 2;

        element.transition().duration(750).call(
            zoomRef.current.transform,
            d3.zoomIdentity
                .translate(zoomTransform.x + width - (width * zoomTransform.scale), zoomTransform.y + height - (height * zoomTransform.scale))
                .scale(zoomTransform.scale)
        );
    }

    return {
        zoomTo
    }
}