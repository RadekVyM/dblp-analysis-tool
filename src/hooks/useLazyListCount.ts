import { RefObject, useCallback, useEffect, useState } from 'react'

/**
 * Hook that creates operations for managing lazily loaded lists. Returns a number of currently displayed items.
 * @param totalCount Total number of items in the list
 * @param countIncrease Number of items that is added on displayed count increase
 * @param observerTarget Element that is observed. When this element is visible in the viewport, displayed count is increased 
 * @returns Number of currently displayed items and reset operation
 */
export default function useLazyListCount(totalCount: number, countIncrease: number, observerTarget: RefObject<HTMLElement>) {
    const [displayedCount, setDisplayedCount] = useState(countIncrease);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setDisplayedCount((oldCount) => {
                        const newCount = oldCount + countIncrease;
                        return totalCount > oldCount ? newCount : oldCount;
                    });
                }
            },
            { threshold: 0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        }
    }, [observerTarget.current, totalCount]);

    const reset = useCallback(() => setDisplayedCount(countIncrease), [setDisplayedCount]);

    return [displayedCount, reset] as [number, () => void];
}