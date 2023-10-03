'use client'

import { useEffect, useState } from 'react'
import SiteHeader from './SiteHeader'
import { BookmarksSideMenu } from './BookmarksSideMenu'
import { BookmarksSideMenuState } from '@/enums/BookmarksSideMenuState'
import useIsNotMobileSize from '@/hooks/useIsNotMobileSize'

const DOCKED_SIDE_MENU_CLASSES = ['md:grid-cols-[1fr_var(--side-bar-width)]', 'md:gap-x-5'];
const UNDOCKED_SIDE_MENU_CLASSES = ['md:grid-cols-[1fr_0]'];

export default function HeaderBookmarks() {
    const isNotMobile = useIsNotMobileSize();
    const [bookmarksSideMenuState, setBookmarksSideMenuState] = useState<BookmarksSideMenuState>(BookmarksSideMenuState.Collapsed);

    useEffect(() => {
        // This is probably not the cleanest solution,
        // but I want to avoid having the pages inside of a client component
        const container = getMainContentContainer();

        container?.classList.remove(...DOCKED_SIDE_MENU_CLASSES, ...UNDOCKED_SIDE_MENU_CLASSES);
        container?.classList.add(...(bookmarksSideMenuState == BookmarksSideMenuState.Docked ? DOCKED_SIDE_MENU_CLASSES : UNDOCKED_SIDE_MENU_CLASSES));
    }, [bookmarksSideMenuState]);

    useEffect(() => {
        if (!isNotMobile) {
            setBookmarksSideMenuState(BookmarksSideMenuState.Collapsed);
        }
    }, [isNotMobile]);

    function authorGroupsMenuHoverChanged(isHovering: boolean) {
        if (bookmarksSideMenuState != BookmarksSideMenuState.Docked) {
            setBookmarksSideMenuState(isHovering ? BookmarksSideMenuState.Floating : BookmarksSideMenuState.Collapsed);
        }
    }

    function authorGroupsMenuButtonClick() {
        setBookmarksSideMenuState(bookmarksSideMenuState != BookmarksSideMenuState.Docked ? BookmarksSideMenuState.Docked : BookmarksSideMenuState.Collapsed)
    }

    return (
        <>
            <SiteHeader
                className='row-start-1 row-end-2 col-start-1 col-end-3'
                authorGroupsMenuState={bookmarksSideMenuState}
                authorGroupsMenuButtonHoverChanged={authorGroupsMenuHoverChanged}
                authorGroupsMenuButtonClick={authorGroupsMenuButtonClick} />
            <BookmarksSideMenu
                className='row-start-2 row-end-3 col-start-1 col-end-3 max-w-screen-xl md:px-4 mx-auto w-full grid-cols-[1fr_var(--side-bar-width)]'
                state={bookmarksSideMenuState}
                bookmarksSideMenuHoverChanged={authorGroupsMenuHoverChanged}
                hide={() => setBookmarksSideMenuState(BookmarksSideMenuState.Collapsed)} />
        </>
    )
}

function getMainContentContainer() {
    return document.body.querySelector('#main-content-container');
}