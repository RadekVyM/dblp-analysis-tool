'use client'

import { cn } from '@/shared/utils/tailwindUtils'
import { useHover } from 'usehooks-ts'
import { useState, useRef, useEffect } from 'react'

// TODO: Find a better name. "Bookmarks" is not the right one at all
// TODO: Do I want the hover feature?
// TODO: How should the mobile version behave?

export enum BookmarksMenuState {
    Collapsed, Floating, Docked
}

type BookmarksMenuParams = {
    className: string,
    state: BookmarksMenuState,
    bookmarksHoverChanged: (value: boolean) => void
}

export default function BookmarksMenu({ className, state, bookmarksHoverChanged }: BookmarksMenuParams) {
    const containerRef = useRef(null);
    const isContainerHovered = useHover(containerRef);

    useEffect(() => {
        bookmarksHoverChanged(isContainerHovered);
    }, [isContainerHovered]);

    return (
        <div
            className={cn(`relative w-full h-full ${state != BookmarksMenuState.Collapsed ? 'grid' : 'hidden'}`, className)}>
            <div
                ref={containerRef}
                className='sticky z-10 grid top-[calc(8rem_+_2px)] md:top-[calc(4rem_+_1px)] col-start-2 col-span-3 max-h-[calc(100vh_-_8rem_-_2px)] md:max-h-[calc(100vh_-_4rem_-_1px)]'>
                <article
                    className='place-self-stretch my-4 p-5 bg-white dark:bg-gray-900 rounded-lg shadow-sm'>
                    <h2 className='sr-only'>Saved Aurhor Groups</h2>

                    <h3 className='font-semibold'>My Aurhor Groups</h3>

                    <h3 className='font-semibold'>Saved Venues</h3>
                </article>
            </div>
        </div>
    )
}