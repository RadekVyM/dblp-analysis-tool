'use client'

import { MdBookmarks } from 'react-icons/md'
import SearchBarButton from './SearchBarButton'
import NavigationMenu from './NavigationMenu'
import { useRef, useEffect } from 'react'
import { SearchDialog } from '../dialogs/SearchDialog'
import ClientButton from '../ClientButton'
import { useHover } from 'usehooks-ts'
import { cn } from '@/utils/tailwindUtils'
import { SavedItemsMenuState } from '@/enums/SavedItemsMenuState'
import useIsNotMobileSize from '@/hooks/useIsNotMobileSize'
import useDialog from '@/hooks/useDialog'
import { useSession } from 'next-auth/react'
import SignInButton from '../SignInButton'
import SiteLogo from './SiteLogo'

type PageHeaderParams = {
    className: string,
    authorGroupsMenuState: SavedItemsMenuState,
    authorGroupsMenuButtonClick: () => void,
    authorGroupsMenuButtonHoverChanged: (value: boolean) => void
}

type SearchParams = {
    className?: string
}

export default function SiteHeader({ authorGroupsMenuButtonHoverChanged, authorGroupsMenuButtonClick, className, authorGroupsMenuState }: PageHeaderParams) {
    const topAuthorGroupsMenuButtonRef = useRef(null);
    const hoverAreaRef = useRef(null);
    const isTopAuthorGroupsMenuButtonHovered = useHover(topAuthorGroupsMenuButtonRef);
    const isHoverAreaHovered = useHover(hoverAreaRef);
    const isNotMobile = useIsNotMobileSize();
    const savedItemsButtonVariant = authorGroupsMenuState === SavedItemsMenuState.Docked && isNotMobile ?
        'icon-default' :
        'icon-outline';
    const session = useSession();

    useEffect(() => {
        if (!isNotMobile) {
            return
        }

        authorGroupsMenuButtonHoverChanged(isTopAuthorGroupsMenuButtonHovered || (isHoverAreaHovered && authorGroupsMenuState != SavedItemsMenuState.Collapsed));
    }, [isTopAuthorGroupsMenuButtonHovered, isHoverAreaHovered]);

    return (
        <header
            className={cn('sticky top-0 z-40 backdrop-blur-lg border-b border-outline-variant', className)}>
            <div
                className='grid grid-rows-[auto_auto] grid-cols-[1fr] md:grid-cols-[1fr_auto] max-w-screen-xl w-full mx-auto px-4'>
                <div
                    className='row-start-1 row-end-2 col-start-1 col-end-2 flex place-items-center gap-6 sm:gap-10 h-16'>
                    <SiteLogo />

                    <div
                        className='flex-1 flex flex-col place-items-end'>
                        <NavigationMenu />
                    </div>
                </div>

                <div
                    className='row-start-2 row-end-3 md:row-start-1 md:row-end-2 col-start-1 col-end-2 md:col-start-2 md:col-end-3
                        relative flex gap-5 place-items-center h-16 md:h-auto md:ml-6'>
                    <Search
                        className='md:min-w-[18rem]' />

                    {
                        session?.status == 'authenticated' ?
                            <>
                                <div
                                    ref={hoverAreaRef}
                                    className={
                                        `absolute right-0 bottom-0 w-16 h-4 mb-[-2px] bg-transparent
                                        ${isTopAuthorGroupsMenuButtonHovered || isHoverAreaHovered ? 'hidden md:block' : 'hidden'}`}>
                                </div>

                                <ClientButton
                                    ref={topAuthorGroupsMenuButtonRef}
                                    variant={savedItemsButtonVariant}
                                    onClick={authorGroupsMenuButtonClick}>
                                    <MdBookmarks />
                                </ClientButton>
                            </> :
                            <SignInButton />
                    }
                </div>
            </div>
        </header>
    )
}

function Search({ className }: SearchParams) {
    const [searchDialog, isSearchDialogOpen, searchDialogAnimation, showSearchDialog, hideSearchDialog] = useDialog();

    return (
        <>
            <SearchBarButton
                className={cn('w-full', className)}
                onClick={() => showSearchDialog()} />

            <SearchDialog
                hide={hideSearchDialog}
                animation={searchDialogAnimation}
                isOpen={isSearchDialogOpen}
                ref={searchDialog} />
        </>
    )
}