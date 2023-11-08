'use client'

import { MdBookmarks } from 'react-icons/md'
import SearchBarButton from './SearchBarButton'
import NavigationMenu from './NavigationMenu'
import { useRef, useEffect } from 'react'
import { SearchDialog } from './SearchDialog'
import ClientButton from './ClientButton'
import { useHover } from 'usehooks-ts'
import { cn } from '@/utils/tailwindUtils'
import { SavedItemsMenuState } from '@/enums/SavedItemsMenuState'
import useIsNotMobileSize from '@/hooks/useIsNotMobileSize'
import useDialog from '@/hooks/useDialog'
import { useSession } from 'next-auth/react'
import SignInButton from './SignInButton'
import SiteLogo from './SiteLogo'

type PageHeaderParams = {
    className: string,
    authorGroupsMenuState: SavedItemsMenuState,
    authorGroupsMenuButtonClick: () => void,
    authorGroupsMenuButtonHoverChanged: (value: boolean) => void
}

type HeaderParams = {
    className: string,
    authorGroupsMenuState: SavedItemsMenuState,
    showDialog: () => void,
    authorGroupsMenuButtonClick: () => void,
    authorGroupsMenuButtonHoverChanged: (value: boolean) => void
}

export default function SiteHeader({ className, authorGroupsMenuState, authorGroupsMenuButtonHoverChanged, authorGroupsMenuButtonClick }: PageHeaderParams) {
    const [searchDialog, isSearchDialogOpen, searchDialogAnimation, showSearchDialog, hideSearchDialog] = useDialog();

    return (
        <>
            <Header
                className={className}
                authorGroupsMenuState={authorGroupsMenuState}
                showDialog={() => showSearchDialog()}
                authorGroupsMenuButtonHoverChanged={authorGroupsMenuButtonHoverChanged}
                authorGroupsMenuButtonClick={authorGroupsMenuButtonClick} />

            <SearchDialog
                hide={hideSearchDialog}
                animation={searchDialogAnimation}
                isOpen={isSearchDialogOpen}
                ref={searchDialog} />
        </>
    )
}

function Header({ showDialog, authorGroupsMenuButtonHoverChanged, authorGroupsMenuButtonClick, className, authorGroupsMenuState }: HeaderParams) {
    const topAuthorGroupsMenuButtonRef = useRef(null);
    const hoverAreaRef = useRef(null);
    const isTopAuthorGroupsMenuButtonHovered = useHover(topAuthorGroupsMenuButtonRef);
    const isHoverAreaHovered = useHover(hoverAreaRef);
    const isNotMobile = useIsNotMobileSize();
    const bookmarkButtonVariant = authorGroupsMenuState === SavedItemsMenuState.Docked && isNotMobile ?
        'icon-default' :
        'icon-outline';
    const session = useSession();

    useEffect(() => {
        authorGroupsMenuButtonHoverChanged(isTopAuthorGroupsMenuButtonHovered || (isHoverAreaHovered && authorGroupsMenuState != SavedItemsMenuState.Collapsed));
    }, [isTopAuthorGroupsMenuButtonHovered, isHoverAreaHovered]);

    return (
        <header
            className={cn('sticky top-0 z-40 backdrop-blur-lg border-b border-outline-variant', className)}>
            <div
                className='grid grid-rows-[auto auto] grid-cols-[1fr] max-w-screen-xl w-full mx-auto px-4'>
                <div
                    className='row-start-1 row-end-2 col-start-1 col-end-2 flex place-items-center gap-6 sm:gap-10 h-16'>
                    <SiteLogo />

                    <div
                        className='flex-1 flex flex-col place-items-end'>
                        <NavigationMenu />
                    </div>

                    <div
                        className='hidden md:flex gap-5'>
                        <SearchBarButton
                            className='min-w-[18rem] w-full'
                            onClick={() => showDialog()} />

                        {
                            session?.status == 'authenticated' ?
                                <ClientButton
                                    ref={topAuthorGroupsMenuButtonRef}
                                    variant={bookmarkButtonVariant}
                                    onClick={authorGroupsMenuButtonClick}>
                                    <MdBookmarks />
                                </ClientButton> :
                                <SignInButton />
                        }
                    </div>
                </div>

                <div
                    className='row-start-2 row-end-3 col-start-1 col-end-2 flex md:hidden gap-5 place-items-center h-16'>
                    <SearchBarButton
                        className='w-full'
                        onClick={() => showDialog()} />

                    {
                        session?.status == 'authenticated' ?
                            <ClientButton
                                variant={bookmarkButtonVariant}
                                onClick={authorGroupsMenuButtonClick}>
                                <MdBookmarks />
                            </ClientButton> :
                            <SignInButton />
                    }
                </div>

                <div
                    ref={hoverAreaRef}
                    className={
                        `row-start-2 row-end-3 md:row-start-1 md:row-end-2 col-start-1 col-end-2 place-self-end w-16 h-4 mb-[-2px] bg-transparent
                        ${isTopAuthorGroupsMenuButtonHovered || isHoverAreaHovered ? 'block' : 'hidden'}`}>
                </div>
            </div>
        </header>
    )
}