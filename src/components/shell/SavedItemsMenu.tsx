'use client'

import { cn } from '@/utils/tailwindUtils'
import { useHover, useIsClient } from 'usehooks-ts'
import { useRef, useEffect, forwardRef, useState } from 'react'
import { MdCancel, MdClose, MdOutlineBookmarks } from 'react-icons/md'
import Button from '../Button'
import { SavedItemsMenuState as SavedItemsMenuState } from '@/enums/SavedItemsMenuState'
import { SearchType } from '@/enums/SearchType'
import Tabs from '../Tabs'
import ListLink from '../ListLink'
import { createLocalPath } from '@/utils/urls'
import useIsNotMobileSize from '@/hooks/useIsNotMobileSize'
import useVisitedAuthors from '@/hooks/useVisitedAuthors'
import useVisitedVenues from '@/hooks/useVisitedVenues'
import useSavedAuthors from '@/hooks/saves/useSavedAuthors'
import useSavedVenues from '@/hooks/saves/useSavedVenues'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'
import { DEFAULT_DISPLAYED_ITEMS_COUNT } from '@/constants/visits'
import { createPortal } from 'react-dom'
import { submitSignOutForm } from '@/services/auth/forms'
import useSession from '@/hooks/useSession'
import useShowMore from '@/hooks/useShowMore'

// TODO: Do I want the hover feature?

type SavedItemsMenuParams = {
    className?: string,
    state: SavedItemsMenuState,
    savedItemsMenuHoverChanged: (value: boolean) => void,
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
    footer?: React.ReactNode,
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

type ShowMoreButtonParams = {
    isExpanded: boolean,
    expand: () => void,
    collapse: () => void
}

/** Menu that displays all the user's saved items (saved authors/venues, author groups, visited authors/venues). */
const SavedItemsMenu = forwardRef<HTMLElement, SavedItemsMenuParams>(({ className, state, savedItemsMenuHoverChanged, hide }, ref) => {
    const isClient = useIsClient();

    return (
        <>
            {
                isClient && createPortal(
                    <MenuContainer
                        ref={ref}
                        className={className}
                        state={state}
                        hide={hide}
                        savedItemsMenuHoverChanged={savedItemsMenuHoverChanged} />, document.body.querySelector('#saveditems-menu-container')!)
            }
        </>
    )
});

SavedItemsMenu.displayName = 'SavedItemsMenu';
export default SavedItemsMenu;

const MenuContainer = forwardRef<HTMLElement, SavedItemsMenuParams>(({ className, state, savedItemsMenuHoverChanged, hide }, ref) => {
    const containerRef = useRef(null);
    const isContainerHovered = useHover(containerRef);
    const isNotMobile = useIsNotMobileSize();
    const isExpanded = state != SavedItemsMenuState.Collapsed;

    useEffect(() => {
        if (isNotMobile) {
            savedItemsMenuHoverChanged(isContainerHovered);
        }
    }, [isContainerHovered]);

    return (
        <div
            className={cn(
                `pointer-events-auto fixed inset-0 z-50 md:relative md:inset-auto md:z-20 w-full h-full isolate bg-transparent`,
                isExpanded ? 'grid grid-cols-[1fr,var(--side-bar-width)] md:grid-cols-1' : 'hidden',
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
                    row-start-1 row-end-2 col-start-2 col-end-3 md:col-start-1 md:col-end-2 md:sticky z-20 md:top-[calc(4rem_+_1px)]
                    grid md:max-h-[calc(100vh_-_4rem_-_1px)]'>
                <Menu
                    ref={ref}
                    className={state == SavedItemsMenuState.Floating ? 'shadow-lg shadow-outline-variant' : ''}
                    hide={hide} />
            </div>
        </div>
    )
});

MenuContainer.displayName = 'MenuContainer';

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
                w-[var(--side-bar-width)]
                overflow-y-hidden
                bg-surface-container rounded-l-lg md:rounded-lg md:border border-outline
                pointer-events-auto animate-slideLeftIn md:animate-none`,
                className)}>
            {
                !session ?
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
                    <form
                        action={submitSignOutForm}>
                        <Button
                            size='xs'>
                            Sign out
                        </Button>
                    </form>
                </li>
                <li>
                    <Button
                        variant='outline'
                        size='xs'
                        href='/profile'>
                        Your profile
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
    const { visitedAuthors, removeVisitedAuthor, isMutating } = useVisitedAuthors();
    const { savedAuthors } = useSavedAuthors();
    const { authorGroups } = useAuthorGroups();
    const [savedAuthorsDisplayedCount, areSavedAuthorsExpanded, expandSavedAuthors, collapseSavedAuthors]
        = useShowMore(DEFAULT_DISPLAYED_ITEMS_COUNT, savedAuthors.length);
    const [groupsDisplayedCount, areGroupsExpanded, expandGroups, collapseGroups]
        = useShowMore(DEFAULT_DISPLAYED_ITEMS_COUNT, authorGroups.length);

    return (
        <TabPanel
            id={SearchType.Author}>
            {
                visitedAuthors.length > 0 &&
                <MenuSection
                    title='Recently Seen'
                    className='mb-4'>
                    {visitedAuthors.slice(0, DEFAULT_DISPLAYED_ITEMS_COUNT).map((author) =>
                        <ListItem
                            key={author.id}
                            link={createLocalPath(author.id, SearchType.Author) || '#'}
                            floatingContent={
                                <button
                                    disabled={isMutating}
                                    className='absolute top-0 bottom-0 right-0 w-8 text-on-surface-container-muted hover:text-on-surface-container rounded-md'
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        removeVisitedAuthor(author.id);
                                    }}>
                                    <MdCancel
                                        className='m-auto' />
                                </button>
                            }>
                            <span className='flex-1 mr-6'>{author.title}</span>
                        </ListItem>)}
                </MenuSection>
            }

            {
                savedAuthors.length > 0 &&
                <MenuSection
                    title='Saved'
                    className={savedAuthors.length > 0 ? 'mb-4' : undefined}
                    footer={
                        savedAuthors.length > DEFAULT_DISPLAYED_ITEMS_COUNT &&
                        <ShowMoreButton
                            isExpanded={areSavedAuthorsExpanded}
                            collapse={collapseSavedAuthors}
                            expand={expandSavedAuthors} />
                    }>
                    {savedAuthors.slice(0, savedAuthorsDisplayedCount).map((author) =>
                        <ListItem
                            key={author.id}
                            link={createLocalPath(author.id, SearchType.Author) || '#'}>
                            <span>{author.title}</span>
                        </ListItem>)}
                </MenuSection>
            }

            {
                authorGroups.length > 0 &&
                <MenuSection
                    title='Groups'
                    footer={
                        authorGroups.length > DEFAULT_DISPLAYED_ITEMS_COUNT &&
                        <ShowMoreButton
                            isExpanded={areGroupsExpanded}
                            collapse={collapseGroups}
                            expand={expandGroups} />
                    }>
                    {authorGroups.slice(0, groupsDisplayedCount).map((group) =>
                        <ListItem
                            key={group.id}
                            link={`/authorgroup/${group.id}`}>
                            <span>{group.title}</span>
                        </ListItem>)}
                </MenuSection>
            }

            {
                visitedAuthors.length == 0 && savedAuthors.length == 0 && authorGroups.length == 0 &&
                <NothingFound
                    items='authors' />
            }
        </TabPanel>
    )
}

function VenuesTab() {
    const { visitedVenues, removeVisitedVenue, isMutating } = useVisitedVenues();
    const { savedVenues } = useSavedVenues();
    const [savedVenuesDisplayedCount, areSavedVenuesExpanded, expandSavedVenues, collapseSavedVenues]
        = useShowMore(DEFAULT_DISPLAYED_ITEMS_COUNT, savedVenues.length);

    return (
        <TabPanel
            id={SearchType.Venue}>
            {
                visitedVenues.length > 0 &&
                <MenuSection
                    title='Recently Seen'
                    className='mb-4'>
                    {visitedVenues.slice(0, DEFAULT_DISPLAYED_ITEMS_COUNT).map((venue) =>
                        <ListItem
                            key={venue.id}
                            link={createLocalPath(venue.id, SearchType.Venue) || '#'}
                            floatingContent={
                                <button
                                    disabled={isMutating}
                                    className='absolute top-0 bottom-0 right-0 w-8 text-on-surface-container-muted hover:text-on-surface-container rounded-md'
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        removeVisitedVenue(venue.id);
                                    }}>
                                    <MdCancel
                                        className='m-auto' />
                                </button>
                            }>
                            <span className='flex-1 mr-6'>{venue.title}</span>
                        </ListItem>)}
                </MenuSection>
            }

            {
                savedVenues.length > 0 &&
                <MenuSection
                    title='Saved'
                    footer={
                        savedVenues.length > DEFAULT_DISPLAYED_ITEMS_COUNT &&
                        <ShowMoreButton
                            isExpanded={areSavedVenuesExpanded}
                            collapse={collapseSavedVenues}
                            expand={expandSavedVenues} />
                    }>
                    {savedVenues.slice(0, savedVenuesDisplayedCount).map((venue) =>
                        <ListItem
                            key={venue.id}
                            link={createLocalPath(venue.id, SearchType.Venue) || '#'}>
                            <span>{venue.title}</span>
                        </ListItem>)}
                </MenuSection>
            }

            {
                visitedVenues.length == 0 && savedVenues.length == 0 &&
                <NothingFound
                    items='venues' />
            }
        </TabPanel>
    )
}

function MenuSection({ title, children, footer, className }: MenuSectionParams) {
    return (
        <section
            className={cn(className, 'mb-3')}>
            <SectionTitle>{title}</SectionTitle>
            <ul
                className='mt-2'>
                {children}
            </ul>
            {footer}
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
            <h2 className='font-bold leading-4'>{session?.user?.username}</h2>
            <span className='text-xs leading-3'>{session?.user?.email}</span>
        </div>
    )
}

function TypeSelection({ selectedType, setSelectedType, className }: TypeSelectionParams) {
    const tabs = [{ content: 'Authors', id: SearchType.Author }, { content: 'Venues', id: SearchType.Venue }];

    return (
        <Tabs
            className={className}
            tabsId='saved-items-menu'
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

function ShowMoreButton({ isExpanded, expand, collapse }: ShowMoreButtonParams) {
    return (
        <button
            className='mx-3 mt-1 text-sm hover:underline hover:text-on-surface-container text-on-surface-container-muted'
            onClick={() => isExpanded ? collapse() : expand()}>
            {isExpanded ? 'Show less' : 'Show more'}
        </button>
    )
}