'use client'

import { PublicationPersonNodeDatum } from '@/dtos/data-visualisation/graphs/PublicationPersonNodeDatum'
import AuthorListItem from './AuthorListItem'
import useLazyListCount from '@/hooks/useLazyListCount'
import { useEffect, useMemo, useRef } from 'react'
import FiltersList from '@/components/FiltersList'
import FiltersDialog from '@/components/dialogs/FiltersDialog'
import useDialog from '@/hooks/useDialog'
import { FiltersState } from '@/dtos/Filters'
import { MdInfo } from 'react-icons/md'
import CheckListButton from '@/components/CheckListButton'
import SearchBox from '@/components/SearchBox'

type AuthorsListParams = {
    nodes: Array<PublicationPersonNodeDatum>
    title: React.ReactNode,
    filteredAuthorsIds: Set<string>,
    searchQuery: string,
    isOnlyCommonCoauthorsOptionVisible: boolean,
    isOriginalAuthorsAlwaysIncludedOptionVisible: boolean,
    onlyCommonCoauthors: boolean,
    intersectionOfCoauthors: boolean,
    originalAuthorsAlwaysIncluded: boolean,
    toggleOriginalAuthorsAlwaysIncluded: () => void,
    toggleOnlyCommonCoauthors: () => void,
    toggleIntersectionOfCoauthors: () => void,
    onSearchQueryChange: (query: string) => void
    onAuthorClick: (id: string | null) => void,
    onAuthorHoverChange: (id: string, isHovered: boolean) => void,
} & FiltersState

type OptionsParams = {
    isOnlyCommonCoauthorsOptionVisible: boolean,
    isOriginalAuthorsAlwaysIncludedOptionVisible: boolean,
    onlyCommonCoauthors: boolean,
    intersectionOfCoauthors: boolean,
    originalAuthorsAlwaysIncluded: boolean,
    toggleOriginalAuthorsAlwaysIncluded: () => void,
    toggleOnlyCommonCoauthors: () => void,
    toggleIntersectionOfCoauthors: () => void,
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
        isOnlyCommonCoauthorsOptionVisible,
        isOriginalAuthorsAlwaysIncludedOptionVisible,
        onlyCommonCoauthors,
        originalAuthorsAlwaysIncluded,
        intersectionOfCoauthors,
        toggleIntersectionOfCoauthors,
        toggleOriginalAuthorsAlwaysIncluded,
        toggleOnlyCommonCoauthors,
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
    }, [nodes, filteredAuthorsIds, resetDisplayedCount]);

    return (
        <article
            className='flex flex-col h-full w-full'>
            <h4 className='mx-4 mt-5 mb-4 font-bold'>{title}</h4>

            <div
                className='flex-1 h-full overflow-auto thin-scrollbar flex flex-col isolate pb-4'>
                <Options
                    isOnlyCommonCoauthorsOptionVisible={isOnlyCommonCoauthorsOptionVisible}
                    isOriginalAuthorsAlwaysIncludedOptionVisible={isOriginalAuthorsAlwaysIncludedOptionVisible}
                    originalAuthorsAlwaysIncluded={originalAuthorsAlwaysIncluded}
                    onlyCommonCoauthors={onlyCommonCoauthors}
                    intersectionOfCoauthors={intersectionOfCoauthors}
                    toggleOriginalAuthorsAlwaysIncluded={toggleOriginalAuthorsAlwaysIncluded}
                    toggleOnlyCommonCoauthors={toggleOnlyCommonCoauthors}
                    toggleIntersectionOfCoauthors={toggleIntersectionOfCoauthors} />

                <div
                    className='sticky top-0 bg-surface-container z-30'>
                    <SearchBox
                        className='mx-4 mb-2'
                        placeholder='Search authors...'
                        searchQuery={searchQuery}
                        onSearchQueryChange={onSearchQueryChange} />
                </div>

                <FiltersList
                    className='mx-4 mb-5 mt-2'
                    showFiltersDialog={showFiltersDialog}
                    filtersMap={filtersMap}
                    switchSelection={switchSelection}
                    clear={clear}
                    maxDisplayedCount={6} />

                {
                    displayedNodes.length > 0 ?
                        <>
                            <ul
                                ref={listRef}
                                className='px-3 pb-0 flex flex-col gap-1'>
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
                            <span className='text-on-surface-muted text-sm'>No authors found</span>
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

function Options({
    isOnlyCommonCoauthorsOptionVisible,
    isOriginalAuthorsAlwaysIncludedOptionVisible,
    originalAuthorsAlwaysIncluded,
    onlyCommonCoauthors,
    intersectionOfCoauthors,
    toggleOriginalAuthorsAlwaysIncluded,
    toggleOnlyCommonCoauthors,
    toggleIntersectionOfCoauthors
}: OptionsParams) {
    if (!isOriginalAuthorsAlwaysIncludedOptionVisible && !isOnlyCommonCoauthorsOptionVisible) {
        return undefined;
    }

    return (
        <div
            className='mx-3 mb-4 flex flex-col gap-1'>
            {
                isOriginalAuthorsAlwaysIncludedOptionVisible &&
                <CheckListButton
                    className='text-xs'
                    isSelected={originalAuthorsAlwaysIncluded}
                    onClick={toggleOriginalAuthorsAlwaysIncluded}>
                    Original authors always included
                </CheckListButton>
            }

            {
                isOnlyCommonCoauthorsOptionVisible &&
                <>
                    <CheckListButton
                        className='text-xs'
                        isSelected={onlyCommonCoauthors}
                        onClick={toggleOnlyCommonCoauthors}>
                        <span>Only common coauthors <MdInfo className='inline' title={`Show only common coauthors of at least two original authors`} /></span>
                    </CheckListButton>
                    <CheckListButton
                        className='text-xs'
                        isSelected={intersectionOfCoauthors}
                        onClick={toggleIntersectionOfCoauthors}>
                        <span>Intersection of coauthors <MdInfo className='inline' title={`Show only common coauthors of all original authors`} /></span>
                    </CheckListButton>
                </>
            }
        </div>
    )
}