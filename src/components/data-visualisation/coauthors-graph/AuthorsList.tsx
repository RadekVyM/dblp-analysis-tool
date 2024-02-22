'use client'

import { PublicationPersonNodeDatum } from '@/dtos/data-visualisation/graphs/PublicationPersonNodeDatum'
import AuthorListItem from './AuthorListItem'
import useLazyListCount from '@/hooks/useLazyListCount'
import { useEffect, useMemo, useRef, useState } from 'react'
import FiltersList from '@/components/FiltersList'
import FiltersDialog from '@/components/dialogs/FiltersDialog'
import useDialog from '@/hooks/useDialog'
import { FiltersState } from '@/dtos/Filters'
import { MdCancel, MdSearch } from 'react-icons/md'
import { isNullOrWhiteSpace } from '@/utils/strings'
import { cn } from '@/utils/tailwindUtils'
import { useDebounce } from 'usehooks-ts'

type AuthorsListParams = {
    nodes: Array<PublicationPersonNodeDatum>
    title: React.ReactNode,
    filteredAuthorsIds: Set<string>,
    searchQuery: string,
    onSearchQueryChange: (query: string) => void
    onAuthorClick: (id: string | null) => void,
    onAuthorHoverChange: (id: string, isHovered: boolean) => void,
} & FiltersState

type SearchBoxParams = {
    className?: string,
    searchQuery: string,
    onSearchQueryChange: (query: string) => void
}

const COUNT_INCREASE = 60;

/** Displays a list of authors in the coauthors graph. These authors can be filtered and searched using this component. */
export default function AuthorsList(
    {
        nodes,
        title,
        filteredAuthorsIds,
        filtersMap,
        searchQuery,
        onSearchQueryChange,
        clear,
        switchSelection,
        onAuthorClick,
        onAuthorHoverChange
    }: AuthorsListParams
) {
    const targerObserver = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [displayedCount, resetDisplayedCount] = useLazyListCount(nodes.length, COUNT_INCREASE, targerObserver);
    const displayedNodes = useMemo(() => nodes.slice(0, displayedCount), [nodes, displayedCount]);
    const [filtersDialog, isFiltersDialogOpen, filtersDialogAnimation, showFiltersDialog, hideFiltersDialog] = useDialog();

    useEffect(() => {
        resetDisplayedCount();
        listRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, [nodes, filteredAuthorsIds]);

    return (
        <article
            className='flex flex-col h-full w-full'>
            <h4 className='mx-4 mt-5 mb-4 font-bold'>{title}</h4>

            <SearchBox
                className='mx-4 mb-3'
                searchQuery={searchQuery}
                onSearchQueryChange={onSearchQueryChange} />

            <div
                className='flex-1 h-full overflow-auto thin-scrollbar py-2 flex flex-col'>
                <FiltersList
                    className='mx-4 mb-4'
                    showFiltersDialog={showFiltersDialog}
                    filtersMap={filtersMap}
                    switchSelection={switchSelection}
                    clear={clear} />

                {
                    displayedNodes.length > 0 ?
                        <>
                            <ul
                                ref={listRef}
                                className='px-3 pb-2 flex flex-col gap-1'>
                                {displayedNodes.map((coauthor) =>
                                    <AuthorListItem
                                        key={coauthor.person.id}
                                        person={coauthor.person}
                                        onAuthorClick={onAuthorClick}
                                        onHoverChange={onAuthorHoverChange} />)}
                            </ul>

                            <div
                                ref={targerObserver}
                                className='h-[5px]'
                                aria-hidden />
                        </> :
                        <div
                            className='flex-1 grid place-content-center'>
                            <span className='text-on-surface-muted text-sm'>No coauthors found</span>
                        </div>
                }
            </div>

            <FiltersDialog
                filtersMap={filtersMap}
                clear={clear}
                switchSelection={switchSelection}
                hide={hideFiltersDialog}
                animation={filtersDialogAnimation}
                isOpen={isFiltersDialogOpen}
                ref={filtersDialog} />
        </article>
    )
}

function SearchBox({ className, searchQuery, onSearchQueryChange }: SearchBoxParams) {
    const [localSearchQuery, setSearchQuery] = useState(searchQuery);
    const debouncedSearchQuery = useDebounce(localSearchQuery, 750);

    useEffect(() => {
        onSearchQueryChange(debouncedSearchQuery);
    }, [debouncedSearchQuery]);

    return (
        <div
            className={cn('relative rounded-lg border border-outline bg-surface-container hover:bg-surface-dim-container transition-colors', className)}>
            <input
                type='text'
                value={localSearchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder='Search authors...'
                className='w-full h-8 px-8 bg-transparent text-sm rounded-lg' />
            <div
                className='absolute top-0 grid place-items-center w-8 h-full pointer-events-none rounded-lg'>
                <MdSearch
                    className='w-4 h-4' />
            </div>
            {
                !isNullOrWhiteSpace(searchQuery) &&
                <button
                    type='button'
                    className='absolute top-0 right-0 grid place-items-center w-8 h-full rounded-lg'
                    onClick={() => setSearchQuery('')}>
                    <MdCancel />
                </button>
            }
        </div>
    )
}