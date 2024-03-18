'use client'

import Popover from '@/components/Popover'
import usePopoverAnchorHover from '@/hooks/usePopoverAnchorHover'
import { MdInfo } from 'react-icons/md'
import { useDebounce } from 'usehooks-ts'

type InfoBadgeParams = {
    info: string,
    popoverContainerRef?: React.RefObject<HTMLDivElement>,
}

/** Badge that displays additional information in a popover on hover. */
export default function InfoBadge({ info, popoverContainerRef }: InfoBadgeParams) {
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
            <MdInfo
                onPointerLeave={onPointerLeave}
                onPointerMove={onPointerMove}
                className='inline'
                aria-label={info} />
            {
                isPopoverHovered &&
                <Popover
                    ref={popoverRef}
                    containerRef={popoverContainerRef}
                    left={position[0]}
                    top={position[1]}
                    className={isPopoverHovered && isPopoverVisible ? 'visible' : 'invisible'}>
                    <div
                        className='px-2 py-1 text-xs'>
                        {info}
                    </div>
                </Popover>
            }
        </>
    )
}