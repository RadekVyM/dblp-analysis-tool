'use client'

import { cn } from '@/shared/utils/tailwindUtils'
import { useHover } from 'usehooks-ts'
import { useRef, useEffect, forwardRef } from 'react'
import { MdClose } from 'react-icons/md'
import Button from './Button'
import useIsNotMobileSize from '@/client/hooks/useIsNotMobileSize'
import { AuthorGroupsMenuState } from '@/shared/enums/AuthorGroupsMenuState'

// TODO: Do I want the hover feature?

type AuthorGroupsMenuParams = {
    className: string,
    state: AuthorGroupsMenuState,
    authorGroupsMenuHoverChanged: (value: boolean) => void,
    hide: () => void,
}

type MenuParams = {
    hide: () => void,
}

export const AuthorGroupsMenu = forwardRef<HTMLElement, AuthorGroupsMenuParams>(({ className, state, authorGroupsMenuHoverChanged: authorGroupsMenuHoverChanged, hide }, ref) => {
    const containerRef = useRef(null);
    const isContainerHovered = useHover(containerRef);
    const isNotMobile = useIsNotMobileSize();
    const isExpanded = state != AuthorGroupsMenuState.Collapsed;

    useEffect(() => {
        if (isNotMobile) {
            authorGroupsMenuHoverChanged(isContainerHovered);
        }
    }, [isContainerHovered]);

    return (
        <>
            <div
                className={cn(
                    `fixed inset-0 z-50 md:relative md:inset-auto md:z-20 w-full h-full isolate pointer-events-none ${isExpanded ? 'grid' : 'hidden'}`,
                    className)}>
                <div
                    onClick={() => hide()}
                    className={`
                        md:hidden row-start-1 row-end-2 col-start-1 col-end-3 bg-[var(--backdrop)] backdrop-blur-md
                        ${isExpanded ? 'pointer-events-auto animate-fadeIn' : 'pointer-events-none'}`}>
                </div>

                <div
                    ref={containerRef}
                    className='
                        row-start-1 row-end-2 col-start-2 col-end-3 md:sticky z-20 md:top-[calc(4rem_+_1px)]
                        grid md:max-h-[calc(100vh_-_4rem_-_1px)] pointer-events-auto'>
                    <Menu
                        ref={ref}
                        hide={hide} />
                </div>
            </div>
        </>
    )
});

const Menu = forwardRef<HTMLElement, MenuParams>(({ hide }, ref) => {
    return (
        <article
            ref={ref}
            className='
                place-self-stretch flex flex-col md:my-4 p-5 pr-3
                bg-gray-50 dark:bg-gray-900 rounded-l-lg md:rounded-lg shadow-sm
                pointer-events-auto animate-slideLeftIn md:animate-none'>
            <Button
                title='Close'
                size='sm' variant='icon-outline'
                className='md:hidden self-end mb-6'
                onClick={() => hide()}>
                <MdClose
                    className='w-5 h-5' />
            </Button>

            <h2 className='sr-only'>Saved Author Groups</h2>

            <h3 className='font-semibold'>My Author Groups</h3>

            <h3 className='font-semibold'>Saved Venues</h3>
        </article>
    )
});