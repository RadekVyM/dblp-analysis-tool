'use client'

import { clamp } from '@/utils/numbers'
import { PointerEvent, useCallback, useRef, useState } from 'react'

/**
 * Hook that maintains state and callbacks for displaying a popover on element hover.
 * @returns State and callbacks that should be attached to the hovered element
 */
export default function usePopoverAnchorHover(containerRef?: React.RefObject<HTMLDivElement>) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<[number, number]>([0, 0]);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const onPointerMove = useCallback((e: PointerEvent<Element>) => {
        const container = containerRef?.current || document.getElementById('popover-container');
        setIsHovered(true);

        if (!popoverRef.current || !container) {
            return;
        }

        const popoverRect = popoverRef.current.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;

        const idealX = mouseX - popoverRect.width;
        const idealY = mouseY - popoverRect.height;
        const x = clamp(idealX, 0, containerRect.width - popoverRect.width);
        const y = clamp(idealY, 0, containerRect.height - popoverRect.height);

        setPosition([x, y]);
    }, [setPosition, setIsHovered, popoverRef.current, containerRef?.current]);

    const onPointerLeave = useCallback((e: PointerEvent<Element>) => {
        setIsHovered(false);
    }, [setIsHovered]);

    return {
        popoverRef,
        position,
        isHovered,
        onPointerMove,
        onPointerLeave
    };
}