'use client'

import Link from 'next/link'
import { MdBookmarks } from 'react-icons/md'
import Button from './Button'
import SearchBarButton from './SearchBarButton'
import NavigationMenu from './NavigationMenu'
import { useState, useRef, useEffect } from 'react'
import { SearchDialog } from './SearchDialog'
import { ClientButton } from './ClientButton'
import { useHover } from 'usehooks-ts'

type HeaderParams = {
    showDialog: () => void,
    setIsBookmarksButtonHovered: (value: boolean) => void
}

export default function PageHeader() {
    const [searchDialogAnimation, setSearchDialogAnimation] = useState('');
    const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
    const [isBookmarksButtonHovered, setIsBookmarksButtonHovered] = useState(false);
    const searchDialog = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        console.log(isBookmarksButtonHovered);
    }, [isBookmarksButtonHovered]);

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
                showDialog={() => showSearchView()}
                setIsBookmarksButtonHovered={setIsBookmarksButtonHovered} />

            <SearchDialog
                hide={hideSearchView}
                animation={searchDialogAnimation}
                isOpen={isSearchDialogOpen}
                ref={searchDialog} />
        </>
    )
}

function Header({ showDialog, setIsBookmarksButtonHovered }: HeaderParams) {
    const bookmarksButtonRef = useRef(null);
    const isBookmarksButtonHovered = useHover(bookmarksButtonRef);

    useEffect(() => {
        setIsBookmarksButtonHovered(isBookmarksButtonHovered);
    }, [isBookmarksButtonHovered]);

    return (
        <header
            className='sticky top-0 z-10 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800'>
            <div
                className='flex place-items-center gap-10 max-w-screen-xl w-full h-16 mx-auto px-4'>
                <Link
                    href='/'
                    className='flex place-items-center gap-5 with-logo'>
                    <h1>
                        <span className='block text-lg/6 font-bold'>dblp</span>
                        <span className='block text-xs/3 text-gray-800 dark:text-gray-400'>analysis tool</span>
                    </h1>
                </Link>

                <div
                    className='flex-1 flex flex-col place-items-end'>
                    <NavigationMenu />
                </div>

                <div
                    className='hidden md:flex gap-5'>
                    <SearchBarButton
                        onClick={() => showDialog()} />

                    <ClientButton
                        ref={bookmarksButtonRef}
                        size='sm' variant='outline' className='aspect-square'>
                        <MdBookmarks
                            className='w-full' />
                    </ClientButton>
                </div>
            </div>

            <div
                className='flex md:hidden gap-5 place-items-center max-w-screen-xl w-full h-16 mx-auto px-4'>
                <SearchBarButton
                    onClick={() => showDialog()} />

                <Button
                    size='sm' variant='outline' className='aspect-square'>
                    <MdBookmarks
                        className='w-full' />
                </Button>
            </div>
        </header>
    )
}