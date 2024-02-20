import { useCallback, useEffect, useState } from 'react'

/**
 * Hook that manages expandable lists.
 * @param collapsedCount Count of items that are displayed when the list is collapsed
 * @param maxCount Count of items that are displayed when the list is expanded
 * @returns State and operations
 */
export default function useShowMore(collapsedCount: number, maxCount: number)
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
    }, [setIsExpanded]);

    return [
        displayedCount,
        isExpanded,
        expand,
        collapse
    ];
}