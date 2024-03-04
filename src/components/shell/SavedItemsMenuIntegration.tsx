'use client'

import { MdBookmarks } from 'react-icons/md'
import ClientButton from '../ClientButton'
import SavedItemsMenu from './SavedItemsMenu'
import { useEffect, useRef, useState } from 'react'
import useIsNotMobileSize from '@/hooks/useIsNotMobileSize'
import { useDebounce, useHover } from 'usehooks-ts'
import { SavedItemsMenuState } from '@/enums/SavedItemsMenuState'
import { DOCKED_SIDE_MENU_CLASSES, UNDOCKED_SIDE_MENU_CLASSES } from '@/constants/sideMenu'

/**
 * Component that renders and manages the saved items menu and button that shows or hides it.
 * 
 * This component implements the hovering feature of the saved items menu - the menu is displayed when user hovers the menu with a cursor.
 */
export function SavedItemsMenuIntegration() {
    const [savedItemsMenuState, setSavedItemsMenuState] = useState<SavedItemsMenuState>(SavedItemsMenuState.Collapsed);
    const isNotMobile = useIsNotMobileSize();
    const savedItemsButtonVariant = savedItemsMenuState === SavedItemsMenuState.Docked && isNotMobile ?
        'icon-default' :
        'icon-outline';
    const {
        hoverAreaRef,
        savedItemsMenuButtonRef,
        isHovered,
        isHoverAreaVisible,
        onSavedItemsMenuHoverChanged
    } = useHoverMenu(isNotMobile, savedItemsMenuState);

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
            return;
        }

        changeState(isHovered);
    }, [isHovered, isNotMobile]);

    function changeState(isHovering: boolean) {
        if (savedItemsMenuState != SavedItemsMenuState.Docked) {
            setSavedItemsMenuState(isHovering ? SavedItemsMenuState.Floating : SavedItemsMenuState.Collapsed);
        }
    }

    function onSavedItemsMenuButtonClick() {
        setSavedItemsMenuState(savedItemsMenuState != SavedItemsMenuState.Docked ? SavedItemsMenuState.Docked : SavedItemsMenuState.Collapsed)
    }

    return (
        <>
            <div
                ref={hoverAreaRef}
                className={
                    `absolute right-0 bottom-0 w-16 h-[calc(1rem+4px)] mb-[-4px] bg-transparent
                    ${isHoverAreaVisible ? 'hidden md:block' : 'hidden'}`}>
            </div>

            <ClientButton
                ref={savedItemsMenuButtonRef}
                variant={savedItemsButtonVariant}
                onClick={onSavedItemsMenuButtonClick}
                className='p-0'>
                <MdBookmarks />
            </ClientButton>

            <SavedItemsMenu
                state={savedItemsMenuState}
                savedItemsMenuHoverChanged={onSavedItemsMenuHoverChanged}
                hide={() => setSavedItemsMenuState(SavedItemsMenuState.Collapsed)} />
        </>
    )
}

/** Hook that manages the hovering feature of the saved items menu. */
function useHoverMenu(isNotMobile: boolean, savedItemsMenuState: SavedItemsMenuState) {
    const [isMenuHovered, setIsMenuHovered] = useState(false);
    const savedItemsMenuButtonRef = useRef(null);
    const hoverAreaRef = useRef(null);
    const isTopAuthorGroupsMenuButtonHovered = useHover(savedItemsMenuButtonRef);
    const isHoverAreaHovered = useHover(hoverAreaRef);
    const isHovered = isNotMobile && (isMenuHovered || isTopAuthorGroupsMenuButtonHovered || (isHoverAreaHovered && savedItemsMenuState != SavedItemsMenuState.Collapsed));
    const debouncedIsHovered = useDebounce(isHovered, 75);
    const isHoverAreaVisible = isTopAuthorGroupsMenuButtonHovered || isHoverAreaHovered;

    function onSavedItemsMenuHoverChanged(isHovering: boolean) {
        setIsMenuHovered(isHovering);
    }

    return {
        hoverAreaRef,
        savedItemsMenuButtonRef,
        isHovered: debouncedIsHovered,
        isHoverAreaVisible,
        onSavedItemsMenuHoverChanged
    };
}

function getMainContentContainer() {
    return document.body.querySelector('#main-content-container');
}