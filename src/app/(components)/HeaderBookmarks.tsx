'use client'

import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import BookmarksMenu, { BookmarksMenuState } from './BookmarksMenu';

export default function HeaderBookmarks() {
    const [bookmarksMenuState, setBookmarksMenuState] = useState<BookmarksMenuState>(BookmarksMenuState.Collapsed);

    useEffect(() => {
        // This is probably not the cleanest solution,
        // but I want to avoid having the pages inside of a client component
        const container = document.body.querySelector('#main-content-container');
        const docked = 'md:grid-cols-[1fr_var(--side-bar-width)]';
        const undocked = 'md:grid-cols-[1fr_0]';

        container?.classList.remove(docked, undocked);
        container?.classList.add(bookmarksMenuState == BookmarksMenuState.Docked ? docked : undocked);
    }, [bookmarksMenuState]);

    function bookmarksHoverChanged(isHovering: boolean) {
        if (bookmarksMenuState != BookmarksMenuState.Docked)
            setBookmarksMenuState(isHovering ? BookmarksMenuState.Floating : BookmarksMenuState.Collapsed);
    }

    function bookmarksButtonClick() {
        setBookmarksMenuState(bookmarksMenuState != BookmarksMenuState.Docked ? BookmarksMenuState.Docked : BookmarksMenuState.Collapsed)
    }

    return (
        <>
            <PageHeader
                className='row-start-1 row-end-2 col-start-1 col-end-3'
                bookmarksMenuState={bookmarksMenuState}
                bookmarksButtonHoverChanged={bookmarksHoverChanged}
                bookmarksButtonClick={bookmarksButtonClick} />
            <BookmarksMenu
                className='row-start-2 row-end-3 col-start-1 col-end-3 max-w-screen-xl px-4 mx-auto w-full grid-cols-[1fr_var(--side-bar-width)]'
                state={bookmarksMenuState}
                bookmarksHoverChanged={bookmarksHoverChanged} />
        </>
    )
}
