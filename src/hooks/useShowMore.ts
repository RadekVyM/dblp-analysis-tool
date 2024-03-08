import { delay } from '@/utils/promises'
import { RefObject, useCallback, useEffect, useState } from 'react'

/**
 * Hook that manages expandable lists.
 * @param collapsedCount Count of items that are displayed when the list is collapsed
 * @param maxCount Count of items that are displayed when the list is expanded
 * @param keptVisibleElement Element that is always kept in the viewport when the expansion state changes  
 * @returns State and operations
 */
export default function useShowMore(collapsedCount: number, maxCount: number, keptVisibleElement?: RefObject<Element>)
    : [displayedCount: number, isExpanded: boolean, expand: () => void, collapse: () => void] {
    const [displayedCount, setDisplayedCount] = useState(collapsedCount);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setDisplayedCount(isExpanded ? maxCount : collapsedCount);
    }, [isExpanded, maxCount, collapsedCount]);

    const expand = useCallback(() => {
        setIsExpanded(true);
    }, [setIsExpanded]);

    const collapse = useCallback(() => {
        setIsExpanded(false);

        // Delaying the scroll to perform the scroll with the newest element size
        delay(50).then(() => {
            keptVisibleElement?.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        });
    }, [setIsExpanded]);

    return [
        displayedCount,
        isExpanded,
        expand,
        collapse
    ];
}