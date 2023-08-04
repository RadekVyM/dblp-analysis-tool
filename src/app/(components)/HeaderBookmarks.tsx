'use client'

import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import BookmarksMenu, { BookmarksMenuState } from './BookmarksMenu';

export default function HeaderBookmarks() {
    const [bookmarksMenuState, setBookmarksMenuState] = useState<BookmarksMenuState>(BookmarksMenuState.Collapsed);

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
                className='row-start-2 row-end-3 col-start-1 col-end-3 max-w-screen-xl px-4 mx-auto w-full grid-cols-[1fr_17rem]'
                state={bookmarksMenuState}
                bookmarksHoverChanged={bookmarksHoverChanged} />
        </>
    )
}
