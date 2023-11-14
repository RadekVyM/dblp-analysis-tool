'use client'

import { MdBookmarks } from 'react-icons/md'
import ClientButton from '../ClientButton'
import { SavedItemsMenu } from './SavedItemsMenu'
import { useEffect, useRef, useState } from 'react'
import useIsNotMobileSize from '@/hooks/useIsNotMobileSize'
import { useDebounce, useHover } from 'usehooks-ts'
import { SavedItemsMenuState } from '@/enums/SavedItemsMenuState'
import { DOCKED_SIDE_MENU_CLASSES, UNDOCKED_SIDE_MENU_CLASSES } from '@/constants/sideMenu'

export function SavedItemsMenuIntegration() {
    const [savedItemsMenuState, setSavedItemsMenuState] = useState<SavedItemsMenuState>(SavedItemsMenuState.Collapsed);
    const [isMenuHovered, setIsMenuHovered] = useState(false);
    const savedItemsMenuButtonRef = useRef(null);
    const hoverAreaRef = useRef(null);
    const isTopAuthorGroupsMenuButtonHovered = useHover(savedItemsMenuButtonRef);
    const isHoverAreaHovered = useHover(hoverAreaRef);
    const isNotMobile = useIsNotMobileSize();
    const savedItemsButtonVariant = savedItemsMenuState === SavedItemsMenuState.Docked && isNotMobile ?
        'icon-default' :
        'icon-outline';

    const isHovered = isNotMobile && (isMenuHovered || isTopAuthorGroupsMenuButtonHovered || (isHoverAreaHovered && savedItemsMenuState != SavedItemsMenuState.Collapsed));
    const debouncedIsHovered = useDebounce(isHovered, 75);

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

    useEffect(() => {
        if (!isNotMobile) {
            return
        }

        changeState(debouncedIsHovered);
    }, [debouncedIsHovered]);

    function changeState(isHovering: boolean) {
        if (savedItemsMenuState != SavedItemsMenuState.Docked) {
            setSavedItemsMenuState(isHovering ? SavedItemsMenuState.Floating : SavedItemsMenuState.Collapsed);
        }
    }

    function savedItemsMenuHoverChanged(isHovering: boolean) {
        setIsMenuHovered(isHovering);
    }

    function savedItemsMenuButtonClick() {
        setSavedItemsMenuState(savedItemsMenuState != SavedItemsMenuState.Docked ? SavedItemsMenuState.Docked : SavedItemsMenuState.Collapsed)
    }

    return (
        <>
            <div
                ref={hoverAreaRef}
                className={
                    `absolute right-0 bottom-0 w-16 h-[calc(1rem+4px)] mb-[-4px] bg-transparent
                    ${isTopAuthorGroupsMenuButtonHovered || isHoverAreaHovered ? 'hidden md:block' : 'hidden'}`}>
            </div>

            <ClientButton
                ref={savedItemsMenuButtonRef}
                variant={savedItemsButtonVariant}
                onClick={savedItemsMenuButtonClick}>
                <MdBookmarks />
            </ClientButton>

            <SavedItemsMenu
                state={savedItemsMenuState}
                savedItemsMenuHoverChanged={savedItemsMenuHoverChanged}
                hide={() => setSavedItemsMenuState(SavedItemsMenuState.Collapsed)} />
        </>
    )
}

function getMainContentContainer() {
    return document.body.querySelector('#main-content-container');
}