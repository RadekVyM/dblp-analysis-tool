'use client'

import { cn } from '@/utils/tailwindUtils'
import { forwardRef } from 'react'
import { createPortal } from 'react-dom'

type PopoverParams = {
    top: number,
    left: number,
    className?: string,
    children?: React.ReactNode,
    containerRef?: React.RefObject<HTMLDivElement>
}

/**
 * Popover that is displayed on the specified position.
 * The popover is displayed in the default container if no container is specified.
 */
const Popover = forwardRef<HTMLDivElement, PopoverParams>(({ top, left, className, children, containerRef }, ref) => {
    return (
        createPortal(
            <div
                ref={ref}
                style={{
                    top: top,
                    left: left
                }}
                className={cn('absolute bg-surface-container border border-outline rounded-lg shadow-lg', className)}>
                {children}
            </div>,
            containerRef?.current || document.getElementById('popover-container')!)
    )
});

Popover.displayName = 'Popover';
export default Popover