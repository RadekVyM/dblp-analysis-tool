import { RefObject, useCallback, useEffect, useState } from 'react'

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
    }, [observerTarget.current]);

    const reset = useCallback(() => setDisplayedCount(countIncrease), [setDisplayedCount]);

    return [displayedCount, reset] as [number, () => void]
}