'use client'

import { RefObject, useState } from 'react'
import { useEventListener, useIsClient } from 'usehooks-ts'

/**
 * Hook that returns operations controlling whether an element is in fullscreen mode or not.
 * @param element Reference object with an HTML element
 * @returns Operations controlling whether an element is in fullscreen mode or not
 */
export default function useFullscreen(element: RefObject<HTMLElement>) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const isClient = useIsClient();
    useEventListener('fullscreenchange', fullscreenchange, element);

    async function toggleFullscreen() {
        if (isFullscreen) {
            await exitFullscreen();
        }
        else {
            await requestFullscreen();
        }
    }

    async function requestFullscreen() {
        await element.current?.requestFullscreen();
    }

    async function exitFullscreen() {
        await document.exitFullscreen();
    }

    function fullscreenchange(e: Event) {
        setIsFullscreen(document.fullscreenElement === element.current);
    }

    return {
        toggleFullscreen,
        requestFullscreen,
        exitFullscreen,
        isFullscreen,
        isFullscreenEnabled: isClient && document.fullscreenEnabled
    };
}