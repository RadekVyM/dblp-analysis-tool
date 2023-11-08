'use client'

import { useEffect, useState } from 'react'
import SiteHeader from './SiteHeader'
import { SavedItemsMenu } from './SavedItemsMenu'
import { SavedItemsMenuState } from '@/enums/SavedItemsMenuState'
import useIsNotMobileSize from '@/hooks/useIsNotMobileSize'

const DOCKED_SIDE_MENU_CLASSES = ['md:grid-cols-[1fr_var(--side-bar-width)]', 'md:gap-x-5'];
const UNDOCKED_SIDE_MENU_CLASSES = ['md:grid-cols-[1fr_0]'];

export default function HeaderSavedItems() {
    const isNotMobile = useIsNotMobileSize();
    const [savedItemsMenuState, setSavedItemsMenuState] = useState<SavedItemsMenuState>(SavedItemsMenuState.Collapsed);

    useEffect(() => {
        // This is probably not the cleanest solution,
        // but I want to avoid having the pages inside of a client component
        const container = getMainContentContainer();

        container?.classList.remove(...DOCKED_SIDE_MENU_CLASSES, ...UNDOCKED_SIDE_MENU_CLASSES);
        container?.classList.add(...(savedItemsMenuState == SavedItemsMenuState.Docked ? DOCKED_SIDE_MENU_CLASSES : UNDOCKED_SIDE_MENU_CLASSES));
    }, [savedItemsMenuState]);

    useEffect(() => {
        if (!isNotMobile) {
            setSavedItemsMenuState(SavedItemsMenuState.Collapsed);
        }
    }, [isNotMobile]);

    function savedItemsMenuHoverChanged(isHovering: boolean) {
        if (savedItemsMenuState != SavedItemsMenuState.Docked) {
            setSavedItemsMenuState(isHovering ? SavedItemsMenuState.Floating : SavedItemsMenuState.Collapsed);
        }
    }

    function savedItemsMenuButtonClick() {
        setSavedItemsMenuState(savedItemsMenuState != SavedItemsMenuState.Docked ? SavedItemsMenuState.Docked : SavedItemsMenuState.Collapsed)
    }

    return (
        <>
            <SiteHeader
                className='row-start-1 row-end-2 col-start-1 col-end-3'
                authorGroupsMenuState={savedItemsMenuState}
                authorGroupsMenuButtonHoverChanged={savedItemsMenuHoverChanged}
                authorGroupsMenuButtonClick={savedItemsMenuButtonClick} />
            <SavedItemsMenu
                className='row-start-2 row-end-3 col-start-1 col-end-3 max-w-screen-xl md:px-4 mx-auto w-full grid-cols-[1fr_var(--side-bar-width)]'
                state={savedItemsMenuState}
                savedItemsMenuHoverChanged={savedItemsMenuHoverChanged}
                hide={() => setSavedItemsMenuState(SavedItemsMenuState.Collapsed)} />
        </>
    )
}

function getMainContentContainer() {
    return document.body.querySelector('#main-content-container');
}