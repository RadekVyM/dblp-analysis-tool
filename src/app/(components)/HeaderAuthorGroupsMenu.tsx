'use client'

import { useEffect, useRef, useState } from 'react'
import SiteHeader from './SiteHeader'
import { AuthorGroupsMenu } from './AurhorGroupsMenu'
import useIsNotMobileSize from '@/client/hooks/useIsNotMobileSize'
import { AuthorGroupsMenuState } from '@/shared/enums/AuthorGroupsMenuState'

const DOCKED_SIDE_MENU_CLASSES = ['md:grid-cols-[1fr_var(--side-bar-width)]', 'md:gap-x-5'];
const UNDOCKED_SIDE_MENU_CLASSES = ['md:grid-cols-[1fr_0]'];

export default function HeaderAuthorGroupsMenu() {
    const isNotMobile = useIsNotMobileSize();
    const [authorGroupsMenuState, setAuthorGroupsMenuState] = useState<AuthorGroupsMenuState>(AuthorGroupsMenuState.Collapsed);

    useEffect(() => {
        // This is probably not the cleanest solution,
        // but I want to avoid having the pages inside of a client component
        const container = getMainContentContainer();

        container?.classList.remove(...DOCKED_SIDE_MENU_CLASSES, ...UNDOCKED_SIDE_MENU_CLASSES);
        container?.classList.add(...(authorGroupsMenuState == AuthorGroupsMenuState.Docked ? DOCKED_SIDE_MENU_CLASSES : UNDOCKED_SIDE_MENU_CLASSES));
    }, [authorGroupsMenuState]);

    useEffect(() => {
        if (!isNotMobile) {
            setAuthorGroupsMenuState(AuthorGroupsMenuState.Collapsed);
        }
    }, [isNotMobile]);

    function authorGroupsMenuHoverChanged(isHovering: boolean) {
        if (authorGroupsMenuState != AuthorGroupsMenuState.Docked) {
            setAuthorGroupsMenuState(isHovering ? AuthorGroupsMenuState.Floating : AuthorGroupsMenuState.Collapsed);
        }
    }

    function authorGroupsMenuButtonClick() {
        setAuthorGroupsMenuState(authorGroupsMenuState != AuthorGroupsMenuState.Docked ? AuthorGroupsMenuState.Docked : AuthorGroupsMenuState.Collapsed)
    }

    return (
        <>
            <SiteHeader
                className='row-start-1 row-end-2 col-start-1 col-end-3'
                authorGroupsMenuState={authorGroupsMenuState}
                authorGroupsMenuButtonHoverChanged={authorGroupsMenuHoverChanged}
                authorGroupsMenuButtonClick={authorGroupsMenuButtonClick} />
            <AuthorGroupsMenu
                className='row-start-2 row-end-3 col-start-1 col-end-3 max-w-screen-xl md:px-4 mx-auto w-full grid-cols-[1fr_var(--side-bar-width)]'
                state={authorGroupsMenuState}
                authorGroupsMenuHoverChanged={authorGroupsMenuHoverChanged}
                hide={() => setAuthorGroupsMenuState(AuthorGroupsMenuState.Collapsed)} />
        </>
    )
}

function getMainContentContainer() {
    return document.body.querySelector('#main-content-container');
}