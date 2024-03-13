'use client'

import usePopoverAnchorHover from '@/hooks/usePopoverAnchorHover'
import { cn } from '@/utils/tailwindUtils'
import Popover from './Popover'
import { useDebounce } from 'usehooks-ts'

type BadgeParams = {
    children: React.ReactNode,
    title?: string,
    isMicro?: boolean,
    className?: string,
    popoverContainerRef?: React.RefObject<HTMLDivElement>,
}

/**
 * Badge that can be, for example, used in headings to display numbers.
 * If the badge is hovered and a title is specified, a popover with the title is displayed.
 */
export default function Badge({ title, children, isMicro, className, popoverContainerRef }: BadgeParams) {
    const {
        isHovered: isPopoverHovered,
        position,
        popoverRef,
        onPointerLeave,
        onPointerMove
    } = usePopoverAnchorHover(popoverContainerRef);
    const isPopoverVisible = useDebounce(isPopoverHovered, 100);

    return (
        <>
            <span
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                aria-label={title}
                className={cn(
                    'py-0.5 text-xs bg-secondary text-on-secondary',
                    isMicro ? 'text-[0.55rem] leading-[0.55rem] px-1 rounded-md' : 'px-2 rounded-lg',
                    className)}>
                {children}
            </span>
            {
                title && isPopoverHovered &&
                <Popover
                    ref={popoverRef}
                    containerRef={popoverContainerRef}
                    left={position[0]}
                    top={position[1]}
                    className={isPopoverHovered && isPopoverVisible ? 'visible' : 'invisible'}>
                    <div
                        className='px-2 py-1 text-xs'>
                        {title}
                    </div>
                </Popover>
            }
        </>
    )
}