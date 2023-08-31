'use client'

import { cn } from '@/shared/utils/tailwindUtils'
import { useHover } from 'usehooks-ts'
import { useRef, useEffect, forwardRef, useState } from 'react'
import { MdClose } from 'react-icons/md'
import Button from './Button'
import useIsNotMobileSize from '@/client/hooks/useIsNotMobileSize'
import { AuthorGroupsMenuState } from '@/shared/enums/AuthorGroupsMenuState'
import { SearchType } from '@/shared/enums/SearchType'
import Tabs from './Tabs'
import { useLocalBookmarkedAuthors, useLocalBookmarkedVenues } from '@/client/hooks/useLocalBookmarks'
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
}

type SectionTitleParams = {
    children: React.ReactNode
}

type ListItemParams = {
    title: string,
    link: string
}

type NothingFoundParams = {
    children: React.ReactNode
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
                        hide={hide} />
                </div>
            </div>
        </>
    )
});

const Menu = forwardRef<HTMLElement, MenuParams>(({ hide }, ref) => {
    const [selectedType, setSelectedType] = useState<SearchType>(SearchType.Author);
    const { authors } = useLocalBookmarkedAuthors();
    const { venues } = useLocalBookmarkedVenues();

    return (
        <article
            ref={ref}
            className='
                place-self-stretch flex flex-col md:my-4 p-5 pr-3
                bg-surface-container rounded-l-lg md:rounded-lg md:border border-outline
                pointer-events-auto animate-slideLeftIn md:animate-none'>
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
                        <>
                            <SectionTitle>Recently Seen</SectionTitle>
                            <ul>
                                {authors.recentlySeen.map((author) =>
                                    <ListItem
                                        key={author.id}
                                        title={author.title}
                                        link={createLocalPath(author.id, SearchType.Author) || '#'} />)}
                            </ul>
                        </>
                    }

                    {
                        authors.bookmarked.length > 0 &&
                        <>
                            <SectionTitle>Bookmarked</SectionTitle>
                            <ul>
                                {authors.bookmarked.map((author) =>
                                    <ListItem
                                        key={author.id}
                                        title={author.title}
                                        link={createLocalPath(author.id, SearchType.Author) || '#'} />)}
                            </ul>
                        </>
                    }

                    {
                        authors.groups.length > 0 &&
                        <>
                            <SectionTitle>Groups</SectionTitle>
                        </>
                    }

                    {
                        authors.recentlySeen.length == 0 && authors.bookmarked.length == 0 && authors.groups.length == 0 &&
                        <NothingFound>
                            No authors bookmarked yet
                        </NothingFound>
                    }
                </>
            }

            {
                selectedType == SearchType.Venue &&
                <>
                    {
                        venues.recentlySeen.length > 0 &&
                        <>
                            <SectionTitle>Recently Seen</SectionTitle>
                            <ul>
                                {venues.recentlySeen.map((venue) =>
                                    <ListItem
                                        key={venue.id}
                                        title={venue.title}
                                        link={createLocalPath(venue.id, SearchType.Venue) || '#'} />)}
                            </ul>
                        </>
                    }

                    {
                        venues.bookmarked.length > 0 &&
                        <>
                            <SectionTitle>Bookmarked</SectionTitle>
                            <ul>
                                {venues.bookmarked.map((venue) =>
                                    <ListItem
                                        key={venue.id}
                                        title={venue.title}
                                        link={createLocalPath(venue.id, SearchType.Venue) || '#'} />)}
                            </ul>
                        </>
                    }

                    {
                        venues.recentlySeen.length == 0 && venues.bookmarked.length == 0 &&
                        <NothingFound>
                            No venues bookmarked yet
                        </NothingFound>
                    }
                </>
            }
        </article >
    )
});

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

function SectionTitle({ children }: SectionTitleParams) {
    return (
        <div
            className='flex justify-between items-center w-full'>
            <h3 className='font-semibold text-sm'>{children}</h3>
        </div>
    )
}

function ListItem({ title, link }: ListItemParams) {
    return (
        <li>
            <ListLink
                href={link}
                className='my-1'
                dangerouslySetInnerHTML={{ __html: title }} />
        </li>
    )
}

function NothingFound({ children }: NothingFoundParams) {
    return (
        <div
            className='flex-1 grid place-content-center'>
            <span
                className='text-center text-on-surface-container-muted text-sm'>
                {children}
            </span>
        </div>
    )
}