'use client'

import { useEffect, useRef, useState } from 'react'
import PageHeader from './PageHeader'
import { AurhorGroupsMenu } from './AurhorGroupsMenu';
import useIsNotMobileSize from '@/client/hooks/useIsNotMobileSize';
import { AurhorGroupsMenuState } from '@/shared/enums/AurhorGroupsMenuState';

const DOCKED_SIDE_MENU_CLASS = 'md:grid-cols-[1fr_var(--side-bar-width)]';
const UNDOCKED_SIDE_MENU_CLASS = 'md:grid-cols-[1fr_0]';

export default function HeaderAurhorGroupsMenu() {
    const isNotMobile = useIsNotMobileSize();
    const [authorGroupsMenuState, setAuthorGroupsMenuState] = useState<AurhorGroupsMenuState>(AurhorGroupsMenuState.Collapsed);

    useEffect(() => {
        // This is probably not the cleanest solution,
        // but I want to avoid having the pages inside of a client component
        const container = getMainContentContainer();

        container?.classList.remove(DOCKED_SIDE_MENU_CLASS, UNDOCKED_SIDE_MENU_CLASS);
        container?.classList.add(authorGroupsMenuState == AurhorGroupsMenuState.Docked ? DOCKED_SIDE_MENU_CLASS : UNDOCKED_SIDE_MENU_CLASS);
    }, [authorGroupsMenuState]);

    useEffect(() => {
        if (!isNotMobile) {
            setAuthorGroupsMenuState(AurhorGroupsMenuState.Collapsed);
        }
    }, [isNotMobile]);

    function authorGroupsMenuHoverChanged(isHovering: boolean) {
        if (authorGroupsMenuState != AurhorGroupsMenuState.Docked) {
            setAuthorGroupsMenuState(isHovering ? AurhorGroupsMenuState.Floating : AurhorGroupsMenuState.Collapsed);
        }
    }

    function authorGroupsMenuButtonClick() {
        setAuthorGroupsMenuState(authorGroupsMenuState != AurhorGroupsMenuState.Docked ? AurhorGroupsMenuState.Docked : AurhorGroupsMenuState.Collapsed)
    }

    return (
        <>
            <PageHeader
                className='row-start-1 row-end-2 col-start-1 col-end-3'
                authorGroupsMenuState={authorGroupsMenuState}
                authorGroupsMenuButtonHoverChanged={authorGroupsMenuHoverChanged}
                authorGroupsMenuButtonClick={authorGroupsMenuButtonClick} />
            <AurhorGroupsMenu
                className='row-start-2 row-end-3 col-start-1 col-end-3 max-w-screen-xl md:px-4 mx-auto w-full grid-cols-[1fr_var(--side-bar-width)]'
                state={authorGroupsMenuState}
                authorGroupsMenuHoverChanged={authorGroupsMenuHoverChanged}
                hide={() => setAuthorGroupsMenuState(AurhorGroupsMenuState.Collapsed)} />
        </>
    )
}

function getMainContentContainer() {
    return document.body.querySelector('#main-content-container');
}