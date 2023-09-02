'use client'

import { cn } from '@/shared/utils/tailwindUtils'
import { useHover } from 'usehooks-ts'
import { useRef, useEffect, forwardRef, useState } from 'react'
import { MdBookmarks, MdClose, MdOutlineBookmarks, MdOutlineRemoveCircle } from 'react-icons/md'
import Button from './Button'
import useIsNotMobileSize from '@/client/hooks/useIsNotMobileSize'
import { AuthorGroupsMenuState } from '@/shared/enums/AuthorGroupsMenuState'
import { SearchType } from '@/shared/enums/SearchType'
import Tabs from './Tabs'
import useLocalBookmarkedAuthors from '@/client/hooks/useLocalBookmarkedAuthors'
import useLocalBookmarkedVenues from '@/client/hooks/useLocalBookmarkedVenues'
import ListLink from './ListLink'
import { createLocalPath } from '@/shared/utils/urls'

// TODO: Do I want the hover feature?

type AuthorGroupsMenuParams = {
    className: string,
    state: AuthorGroupsMenuState,
    authorGroupsMenuHoverChanged: (value: boolean) => void,
    hide: () => void,
}

type TypeSelectionParams = {
    selectedType: SearchType,
    setSelectedType: (type: SearchType) => void
}

type MenuParams = {
    hide: () => void,
    className?: string
}

type SectionTitleParams = {
    children: React.ReactNode
}

type MenuSectionParams = {
    title: React.ReactNode,
    children: React.ReactNode,
    className?: string
}

type ListItemParams = {
    children: React.ReactNode,
    floatingContent?: React.ReactNode,
    link: string
}

type NothingFoundParams = {
    items: string
}

export const AuthorGroupsMenu = forwardRef<HTMLElement, AuthorGroupsMenuParams>(({ className, state, authorGroupsMenuHoverChanged: authorGroupsMenuHoverChanged, hide }, ref) => {
    const containerRef = useRef(null);
    const isContainerHovered = useHover(containerRef);
    const isNotMobile = useIsNotMobileSize();
    const isExpanded = state != AuthorGroupsMenuState.Collapsed;

    useEffect(() => {
        if (isNotMobile) {
            authorGroupsMenuHoverChanged(isContainerHovered);
        }
    }, [isContainerHovered]);

    return (
        <>
            <div
                className={cn(
                    `fixed inset-0 z-50 md:relative md:inset-auto md:z-20 w-full h-full isolate pointer-events-none ${isExpanded ? 'grid' : 'hidden'}`,
                    className)}>
                <div
                    onClick={() => hide()}
                    className={`
                        md:hidden row-start-1 row-end-2 col-start-1 col-end-3 bg-[var(--backdrop)] backdrop-blur-md
                        ${isExpanded ? 'pointer-events-auto animate-fadeIn' : 'pointer-events-none'}`}>
                </div>

                <div
                    ref={containerRef}
                    className='
                        row-start-1 row-end-2 col-start-2 col-end-3 md:sticky z-20 md:top-[calc(4rem_+_1px)]
                        grid md:max-h-[calc(100vh_-_4rem_-_1px)] pointer-events-auto'>
                    <Menu
                        ref={ref}
                        className={state == AuthorGroupsMenuState.Floating ? 'shadow-lg shadow-outline-variant' : ''}
                        hide={hide} />
                </div>
            </div>
        </>
    )
});

AuthorGroupsMenu.displayName = 'AuthorGroupsMenu';

const Menu = forwardRef<HTMLElement, MenuParams>(({ className, hide }, ref) => {
    const [selectedType, setSelectedType] = useState<SearchType>(SearchType.Author);
    const [isClient, setIsClient] = useState(false);
    const { authors, removeRecentlySeenAuthor } = useLocalBookmarkedAuthors();
    const { venues } = useLocalBookmarkedVenues();

    useEffect(() => setIsClient(true), [])

    return (
        isClient &&
        <article
            ref={ref}
            className={cn(`
                place-self-stretch flex flex-col md:my-4 p-5 pr-3
                overflow-y-auto
                bg-surface-container rounded-l-lg md:rounded-lg md:border border-outline
                pointer-events-auto animate-slideLeftIn md:animate-none`,
                className)}>
            <div
                className='flex justify-between items-center mb-6'>
                <TypeSelection
                    selectedType={selectedType}
                    setSelectedType={(type) => setSelectedType(type)} />

                <Button
                    title='Close'
                    size='sm' variant='icon-outline'
                    className='md:hidden self-end'
                    onClick={() => hide()}>
                    <MdClose
                        className='w-5 h-5' />
                </Button>
            </div>

            <h2 className='sr-only'>Saved authors and venues</h2>

            {
                selectedType == SearchType.Author &&
                <>
                    {
                        authors.recentlySeen.length > 0 &&
                        <MenuSection
                            title='Recently Seen'
                            className='mb-4'>
                            {authors.recentlySeen.slice(0, 5).map((author) =>
                                <ListItem
                                    key={author.id}
                                    link={createLocalPath(author.id, SearchType.Author) || '#'}
                                    floatingContent={
                                        <button
                                            className='absolute top-0 bottom-0 right-0 w-8 text-on-surface-container-muted hover:text-on-surface-container rounded-md'
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                removeRecentlySeenAuthor(author.id);
                                            }}>
                                            <MdOutlineRemoveCircle
                                                className='m-auto' />
                                        </button>
                                    }>
                                    <span className='flex-1 mr-8' dangerouslySetInnerHTML={{ __html: author.title }}></span>
                                </ListItem>)}
                        </MenuSection>
                    }

                    {
                        authors.bookmarked.length > 0 &&
                        <MenuSection
                            title='Bookmarked'
                            className='mb-4'>
                            {authors.bookmarked.slice(0, 10).map((author) =>
                                <ListItem
                                    key={author.id}
                                    link={createLocalPath(author.id, SearchType.Author) || '#'}>
                                    <span dangerouslySetInnerHTML={{ __html: author.title }}></span>
                                </ListItem>)}
                        </MenuSection>
                    }

                    {
                        authors.groups.length > 0 &&
                        <MenuSection
                            title='Groups'>
                            {authors.groups.map((group) =>
                                <ListItem
                                    key={group.id}
                                    link='#'>
                                    <span dangerouslySetInnerHTML={{ __html: group.title }}></span>
                                </ListItem>)}
                        </MenuSection>
                    }

                    {
                        authors.recentlySeen.length == 0 && authors.bookmarked.length == 0 && authors.groups.length == 0 &&
                        <NothingFound
                            items='authors' />
                    }
                </>
            }

            {
                selectedType == SearchType.Venue &&
                <>
                    {
                        venues.recentlySeen.length > 0 &&
                        <MenuSection
                            title='Recently Seen'>
                            {venues.recentlySeen.map((venue) =>
                                <ListItem
                                    key={venue.id}
                                    link={createLocalPath(venue.id, SearchType.Venue) || '#'}>
                                    <span dangerouslySetInnerHTML={{ __html: venue.title }}></span>
                                </ListItem>)}
                        </MenuSection>
                    }

                    {
                        venues.bookmarked.length > 0 &&
                        <MenuSection
                            title='Bookmarked'>
                            {venues.bookmarked.map((venue) =>
                                <ListItem
                                    key={venue.id}
                                    link={createLocalPath(venue.id, SearchType.Venue) || '#'}>
                                    <span dangerouslySetInnerHTML={{ __html: venue.title }}></span>
                                </ListItem>)}
                        </MenuSection>
                    }

                    {
                        venues.recentlySeen.length == 0 && venues.bookmarked.length == 0 &&
                        <NothingFound
                            items='venues' />
                    }
                </>
            }
        </article >
    )
});

Menu.displayName = 'Menu';

function MenuSection({ title, children, className }: MenuSectionParams) {
    return (
        <section
            className={className}>
            <SectionTitle>{title}</SectionTitle>
            <ul
                className='my-2'>
                {children}
            </ul>
        </section>
    )
}

function SectionTitle({ children }: SectionTitleParams) {
    return (
        <div
            className='flex justify-between items-center w-full'>
            <h3 className='font-semibold text-sm'>{children}</h3>
        </div>
    )
}

function TypeSelection({ selectedType, setSelectedType }: TypeSelectionParams) {
    const tabs = [{ title: 'Authors', id: SearchType.Author }, { title: 'Venues', id: SearchType.Venue }];

    return (
        <Tabs
            tabsId='bookmarks-menu'
            items={tabs}
            legend='Select authors or venues:'
            selectedId={selectedType}
            setSelectedId={(id) => setSelectedType(id as SearchType)}
            size='xs' />
    )
}

function ListItem({ children, floatingContent, link }: ListItemParams) {
    return (
        <li
            className='relative'>
            <ListLink
                href={link}
                surface='container'
                size='sm'
                marker='none'
                className='my-1 flex-row gap-x-3'>
                {children}
            </ListLink>
            {floatingContent}
        </li>
    )
}

function NothingFound({ items }: NothingFoundParams) {
    return (
        <div
            className='flex-1 flex flex-col place-content-center items-center gap-4'>
            <MdOutlineBookmarks
                className='w-10 h-10 text-on-surface-container-muted' />
            <span
                className='text-center text-on-surface-container-muted text-sm'>
                No {items} bookmarked yet
            </span>
        </div>
    )
}