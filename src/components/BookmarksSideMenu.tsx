'use client'

import { cn } from '@/utils/tailwindUtils'
import { useHover } from 'usehooks-ts'
import { useRef, useEffect, forwardRef, useState } from 'react'
import { MdCancel, MdClose, MdOutlineBookmarks } from 'react-icons/md'
import Button from './Button'
import { BookmarksSideMenuState as BookmarksSideMenuState } from '@/enums/BookmarksSideMenuState'
import { SearchType } from '@/enums/SearchType'
import Tabs from './Tabs'
import ListLink from './ListLink'
import { createLocalPath } from '@/utils/urls'
import useIsNotMobileSize from '@/hooks/useIsNotMobileSize'
import useLocalBookmarkedAuthors from '@/hooks/useLocalBookmarkedAuthors'
import useLocalBookmarkedVenues from '@/hooks/useLocalBookmarkedVenues'
import { signOut, useSession } from 'next-auth/react'
import useSavedAuthors from '@/hooks/saves/useSavedAuthors'
import useSavedVenues from '@/hooks/saves/useSavedVenues'

// TODO: Do I want the hover feature?

type BookmarksSideMenuParams = {
    className?: string,
    state: BookmarksSideMenuState,
    bookmarksSideMenuHoverChanged: (value: boolean) => void,
    hide: () => void,
}

type TabPanelParams = {
    className?: string,
    children: React.ReactNode,
    id: any
}

type UserInfoParams = {
    className?: string
}

type TypeSelectionParams = {
    selectedType: SearchType,
    setSelectedType: (type: SearchType) => void,
    className?: string
}

type MenuParams = {
    hide: () => void,
    className?: string
}

type MenuContentParams = {
    hide: () => void
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

export const BookmarksSideMenu = forwardRef<HTMLElement, BookmarksSideMenuParams>(({ className, state, bookmarksSideMenuHoverChanged, hide }, ref) => {
    const containerRef = useRef(null);
    const isContainerHovered = useHover(containerRef);
    const isNotMobile = useIsNotMobileSize();
    const isExpanded = state != BookmarksSideMenuState.Collapsed;

    useEffect(() => {
        if (isNotMobile) {
            bookmarksSideMenuHoverChanged(isContainerHovered);
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
                        className={state == BookmarksSideMenuState.Floating ? 'shadow-lg shadow-outline-variant' : ''}
                        hide={hide} />
                </div>
            </div>
        </>
    )
});

BookmarksSideMenu.displayName = 'BookmarksSideMenu';

const Menu = forwardRef<HTMLElement, MenuParams>(({ className, hide }, ref) => {
    const [isClient, setIsClient] = useState(false);
    const session = useSession();

    useEffect(() => setIsClient(true), []);

    return (
        isClient &&
        <article
            ref={ref}
            className={cn(`
                place-self-stretch flex flex-col md:my-4 pt-5 max-h-[100vh]
                overflow-y-hidden
                bg-surface-container rounded-l-lg md:rounded-lg md:border border-outline
                pointer-events-auto animate-slideLeftIn md:animate-none`,
                className)}>
            {
                session.status !== 'authenticated' ?
                    <NotAuthenticated /> :
                    <MenuContent
                        hide={hide} />
            }
        </article>
    )
});

Menu.displayName = 'Menu';

function MenuContent({ hide }: MenuContentParams) {
    const [selectedType, setSelectedType] = useState<SearchType>(SearchType.Author);

    return (
        <>
            <div
                className='flex justify-between items-center mb-6 pl-5 pr-3'>
                <UserInfo />
                <Button
                    title='Close'
                    size='sm' variant='icon-outline'
                    className='md:hidden self-start'
                    onClick={() => hide()}>
                    <MdClose
                        className='w-5 h-5' />
                </Button>
            </div>

            <TypeSelection
                className='px-5 mb-6'
                selectedType={selectedType}
                setSelectedType={(type) => setSelectedType(type)} />

            {
                selectedType == SearchType.Author &&
                <AuthorsTab
                    key={SearchType.Author} />
            }

            {
                selectedType == SearchType.Venue &&
                <VenuesTab
                    key={SearchType.Venue} />
            }

            <ul
                className='flex gap-2 mx-6 py-6 border-t border-outline-variant'>
                <li>
                    <Button
                        size='xs'
                        onClick={async () => await signOut()}>
                        Sign Out
                    </Button>
                </li>
                <li>
                    <Button
                        variant='outline'
                        size='xs'
                        href='/profile'>
                        Your Profile
                    </Button>
                </li>
            </ul>
        </>
    )
}

function TabPanel({ id, className, children }: TabPanelParams) {
    return (
        <div
            role='tabpanel'
            aria-labelledby={id}
            className={cn('flex-1 flex flex-col overflow-y-auto pb-3 pl-5 pr-3 thin-scrollbar', className)}>
            {children}
        </div>
    )
}

function AuthorsTab() {
    const { authors, removeRecentlySeenAuthor } = useLocalBookmarkedAuthors();
    const { savedAuthors } = useSavedAuthors();

    return (
        <TabPanel
            id={SearchType.Author}>
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
                                    <MdCancel
                                        className='m-auto' />
                                </button>
                            }>
                            <span className='flex-1 mr-8' dangerouslySetInnerHTML={{ __html: author.title }}></span>
                        </ListItem>)}
                </MenuSection>
            }

            {
                savedAuthors.length > 0 &&
                <MenuSection
                    title='Saved'
                    className={authors.groups.length > 0 ? 'mb-4' : undefined}>
                    {savedAuthors.map((author) =>
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
                authors.recentlySeen.length == 0 && savedAuthors.length == 0 && authors.groups.length == 0 &&
                <NothingFound
                    items='authors' />
            }
        </TabPanel>
    )
}

function VenuesTab() {
    const { venues, removeRecentlySeenVenue } = useLocalBookmarkedVenues();
    const { savedVenues } = useSavedVenues();

    return (
        <TabPanel
            id={SearchType.Venue}>
            {
                venues.recentlySeen.length > 0 &&
                <MenuSection
                    title='Recently Seen'
                    className='mb-4'>
                    {venues.recentlySeen.slice(0, 5).map((venue) =>
                        <ListItem
                            key={venue.id}
                            link={createLocalPath(venue.id, SearchType.Venue) || '#'}
                            floatingContent={
                                <button
                                    className='absolute top-0 bottom-0 right-0 w-8 text-on-surface-container-muted hover:text-on-surface-container rounded-md'
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        removeRecentlySeenVenue(venue.id);
                                    }}>
                                    <MdCancel
                                        className='m-auto' />
                                </button>
                            }>
                            <span className='flex-1 mr-8' dangerouslySetInnerHTML={{ __html: venue.title }}></span>
                        </ListItem>)}
                </MenuSection>
            }

            {
                savedVenues.length > 0 &&
                <MenuSection
                    title='Saved'>
                    {savedVenues.map((venue) =>
                        <ListItem
                            key={venue.id}
                            link={createLocalPath(venue.id, SearchType.Venue) || '#'}>
                            <span dangerouslySetInnerHTML={{ __html: venue.title }}></span>
                        </ListItem>)}
                </MenuSection>
            }

            {
                venues.recentlySeen.length == 0 && savedVenues.length == 0 &&
                <NothingFound
                    items='venues' />
            }
        </TabPanel>
    )
}

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

function UserInfo({ className }: UserInfoParams) {
    const session = useSession();

    return (
        <div>
            <h2 className='font-bold leading-4'>{session.data?.user?.name}</h2>
            <span className='text-xs leading-3'>{session.data?.user?.email}</span>
        </div>
    )
}

function TypeSelection({ selectedType, setSelectedType, className }: TypeSelectionParams) {
    const tabs = [{ content: 'Authors', id: SearchType.Author }, { content: 'Venues', id: SearchType.Venue }];

    return (
        <Tabs
            className={className}
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
            <p
                className='text-center text-on-surface-container-muted text-sm'>
                No {items} saved yet
            </p>
        </div>
    )
}

function NotAuthenticated() {
    return (
        <div
            className='flex-1 flex flex-col place-content-center items-center gap-4 px-6'>
            <MdOutlineBookmarks
                className='w-10 h-10 text-on-surface-container-muted' />
            <p
                className='text-center text-on-surface-container-muted text-sm'>
                You must sign in first to access your saved authors and venues
            </p>
            <Button
                size='sm'
                href='/api/auth/signin'>
                Sign In
            </Button>
        </div>
    )
}