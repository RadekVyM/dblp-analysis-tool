'use client'

import Link from 'next/link'
import { MdBookmarks } from 'react-icons/md'
import SearchBarButton from './SearchBarButton'
import NavigationMenu from './NavigationMenu'
import { useState, useRef, useEffect } from 'react'
import { SearchDialog } from './SearchDialog'
import { ClientButton } from './ClientButton'
import { useHover } from 'usehooks-ts'
import { cn } from '@/shared/utils/tailwindUtils'
import useIsNotMobileSize from '@/client/hooks/useIsNotMobileSize'
import { AuthorGroupsMenuState } from '@/shared/enums/AuthorGroupsMenuState'

type PageHeaderParams = {
    className: string,
    authorGroupsMenuState: AuthorGroupsMenuState,
    authorGroupsMenuButtonClick: () => void,
    authorGroupsMenuButtonHoverChanged: (value: boolean) => void
}

type HeaderParams = {
    className: string,
    authorGroupsMenuState: AuthorGroupsMenuState,
    showDialog: () => void,
    authorGroupsMenuButtonClick: () => void,
    authorGroupsMenuButtonHoverChanged: (value: boolean) => void
}

export default function SiteHeader({ className, authorGroupsMenuState, authorGroupsMenuButtonHoverChanged, authorGroupsMenuButtonClick }: PageHeaderParams) {
    const [searchDialogAnimation, setSearchDialogAnimation] = useState('');
    const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
    const searchDialog = useRef<HTMLDialogElement>(null);

    function showSearchView() {
        setSearchDialogAnimation('backdrop:animate-fadeIn animate-slideUpIn');
        searchDialog.current?.showModal();
        setIsSearchDialogOpen(true);
    }

    function hideSearchView() {
        setSearchDialogAnimation('backdrop:animate-fadeOut animate-slideDownOut');
        let timeout = setTimeout(() => {
            searchDialog.current?.close();
            setIsSearchDialogOpen(false);
            clearTimeout(timeout);
        }, 150);
    }

    return (
        <>
            <Header
                className={className}
                authorGroupsMenuState={authorGroupsMenuState}
                showDialog={() => showSearchView()}
                authorGroupsMenuButtonHoverChanged={authorGroupsMenuButtonHoverChanged}
                authorGroupsMenuButtonClick={authorGroupsMenuButtonClick} />

            <SearchDialog
                hide={hideSearchView}
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
    const bookmarkButtonVariant = authorGroupsMenuState == AuthorGroupsMenuState.Docked && isNotMobile ? 'icon-default' : 'icon-outline';

    useEffect(() => {
        authorGroupsMenuButtonHoverChanged(isTopAuthorGroupsMenuButtonHovered || (isHoverAreaHovered && authorGroupsMenuState != AuthorGroupsMenuState.Collapsed));
    }, [isTopAuthorGroupsMenuButtonHovered, isHoverAreaHovered]);

    return (
        <header
            className={cn('sticky top-0 z-40 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800', className)}>
            <div
                className='grid grid-rows-[auto auto] grid-cols-[1fr] max-w-screen-xl w-full mx-auto px-4'>
                <div
                    className='row-start-1 row-end-2 col-start-1 col-end-2 flex place-items-center gap-6 sm:gap-10 h-16'>
                    <Link
                        href='/'
                        className='flex place-items-center gap-3 xs:gap-5 with-logo'>
                        <h1>
                            <span className='block text-lg/6 font-extrabold'>dblp</span>
                            <span className='block text-xs/3 text-gray-800 dark:text-gray-400 font-semibold whitespace-nowrap'>analysis tool</span>
                        </h1>
                    </Link>

                    <div
                        className='flex-1 flex flex-col place-items-end'>
                        <NavigationMenu />
                    </div>

                    <div
                        className='hidden md:flex gap-5'>
                        <SearchBarButton
                            className='min-w-[18rem] w-full'
                            onClick={() => showDialog()} />

                        <ClientButton
                            ref={topAuthorGroupsMenuButtonRef}
                            variant={bookmarkButtonVariant}
                            onClick={authorGroupsMenuButtonClick}>
                            <MdBookmarks
                                className='w-full' />
                        </ClientButton>
                    </div>
                </div>

                <div
                    className='row-start-2 row-end-3 col-start-1 col-end-2 flex md:hidden gap-5 place-items-center h-16'>
                    <SearchBarButton
                        className='w-full'
                        onClick={() => showDialog()} />

                    <ClientButton
                        variant={bookmarkButtonVariant}
                        onClick={authorGroupsMenuButtonClick}>
                        <MdBookmarks
                            className='w-full' />
                    </ClientButton>
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