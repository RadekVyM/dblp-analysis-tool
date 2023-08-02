'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MdBookmarks } from 'react-icons/md'
import Button from './Button'
import SearchBarButton from './SearchBarButton'
import NavigationMenu from './NavigationMenu'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SearchDialog } from './SearchDialog'

type HeaderParams = {
    showDialog: () => void
}

export default function PageHeader() {
    const [searchViewAnimation, setSearchViewAnimation] = useState('');
    const router = useRouter();
    const searchDialog = useRef<HTMLDialogElement>(null);

    function showSearchView() {
        setSearchViewAnimation('backdrop:animate-fadeIn animate-fadeIn');
        searchDialog.current?.showModal();
    }

    function hideSearchView() {
        setSearchViewAnimation('backdrop:animate-fadeOut animate-fadeOut');
        let timeout = setTimeout(() => {
            searchDialog.current?.close();
            clearTimeout(timeout);
        }, 150);
    }

    return (
        <>
            <Header
                showDialog={() => showSearchView()} />

            <SearchDialog
                onHide={hideSearchView}
                onTestButtonClick={() => {
                    router.push('/search/author');
                    hideSearchView();
                }}
                animation={searchViewAnimation}
                ref={searchDialog} />
        </>
    )
}

function Header({ showDialog }: HeaderParams) {
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

                    <Button
                        size='sm' variant='outline' className='aspect-square'>
                        <MdBookmarks
                            className='w-full' />
                    </Button>
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