'use client'

import CheckListButton from '@/components/CheckListButton'
import AuthorListItem from './AuthorListItem'
import LoadingWheel from '@/components/LoadingWheel'
import { RefObject, useEffect, useMemo, useRef } from 'react'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import LinkArrow from '@/components/LinkArrow'
import Link from 'next/link'
import { HiArrowNarrowLeft } from 'react-icons/hi'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import { PublicationPersonNodeDatum } from '@/dtos/data-visualisation/graphs/PublicationPersonNodeDatum'
import useAuthor from '@/hooks/authors/useAuthor'
import useLazyListCount from '@/hooks/useLazyListCount'
import useCommonUncommonCoauthors from '@/hooks/data-visualisation/useCommonUncomonCoauthors'
import { MdInfo, MdLibraryBooks } from 'react-icons/md'
import { useDebounce } from 'usehooks-ts'
import usePopoverAnchorHover from '@/hooks/usePopoverAnchorHover'
import Popover from '@/components/Popover'

const COUNT_INCREASE = 60;

type SelectedAuthorParams = {
    onBackClick: () => void
} & SelectedAuthorContentParams

type SelectedAuthorContentParams = {
    originalAuthorIds: Array<string>,
    allIncludedAuthorIds: Array<string>,
    selectedAuthor: PublicationPersonNodeDatum,
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    popoverContainerRef?: React.RefObject<HTMLDivElement>,
    addAuthor: (author: DblpAuthor) => void,
    removeAuthor: (id: string) => void,
    onCoauthorClick: (id: string | null) => void,
    onCoauthorHoverChange: (id: string, isHovered: boolean) => void
}

type SectionHeadingParams = {
    children: React.ReactNode,
    info?: string,
    popoverContainerRef?: React.RefObject<HTMLDivElement>,
}

type SamePublicationTagParams = {
    popoverContainerRef?: React.RefObject<HTMLDivElement>
}

/** Displays basic information about currently selected author in the coauthors graph and their coauthors.  */
export default function SelectedAuthor({
    selectedAuthor,
    authorsMap,
    allIncludedAuthorIds,
    originalAuthorIds,
    popoverContainerRef,
    addAuthor,
    removeAuthor,
    onBackClick,
    onCoauthorClick,
    onCoauthorHoverChange
}: SelectedAuthorParams) {
    return (
        <article
            className='flex flex-col h-full w-full'>
            <button
                className='mx-4 mt-4 self-start flex gap-2 items-center text-on-surface-container hover:text-on-surface-container-muted'
                onClick={onBackClick}>
                <HiArrowNarrowLeft />
                Back
            </button>
            <Link
                prefetch={false}
                className='mx-4 mt-5 link-heading block w-fit text-on-surface-muted hover:text-on-surface transition-colors'
                href={createLocalPath(selectedAuthor.person.id, SearchType.Author)}>
                <h4
                    className='inline font-bold text-on-surface'>
                    {selectedAuthor.person.name}
                </h4>
                <LinkArrow
                    className='w-6 h-5 ml-[-0.1rem] mt-[-0.2rem]' />
            </Link>

            <SelectedAuthorContent
                allIncludedAuthorIds={allIncludedAuthorIds}
                originalAuthorIds={originalAuthorIds}
                selectedAuthor={selectedAuthor}
                authorsMap={authorsMap}
                popoverContainerRef={popoverContainerRef}
                addAuthor={addAuthor}
                removeAuthor={removeAuthor}
                onCoauthorClick={onCoauthorClick}
                onCoauthorHoverChange={onCoauthorHoverChange} />
        </article>
    )
}

function SelectedAuthorContent({
    selectedAuthor,
    authorsMap,
    allIncludedAuthorIds,
    originalAuthorIds,
    popoverContainerRef,
    addAuthor,
    removeAuthor,
    onCoauthorClick,
    onCoauthorHoverChange
}: SelectedAuthorContentParams) {
    const targerObserver = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const { author: fetchedAuthor, error, isLoading } = useAuthor(selectedAuthor.person.id);
    // Included author is an original author or an author whose coauthors were included in the graph
    const isIncludedAuthor = useMemo(() => allIncludedAuthorIds.some((id) => id === selectedAuthor.person.id), [allIncludedAuthorIds, selectedAuthor]);
    const { displayedCommonCoauthors, displayedUncommonCoauthors } = useDisplayedCoauthors(
        targerObserver,
        listRef,
        authorsMap,
        fetchedAuthor,
        isIncludedAuthor,
        allIncludedAuthorIds);

    function onIncludeAllClick() {
        if (!fetchedAuthor) {
            return;
        }

        if (isIncludedAuthor) {
            removeAuthor(fetchedAuthor.id);
        }
        else {
            addAuthor(fetchedAuthor);
        }
    }

    return isLoading ?
        <div
            className='flex-1 grid place-content-center'>
            <LoadingWheel
                className='text-on-surface-container-muted w-8 h-8' />
        </div> :
        <div
            ref={listRef}
            className='flex-1 h-full pb-2 mt-2 overflow-auto thin-scrollbar'>
            {
                (fetchedAuthor?.info?.affiliations.length || 0) > 0 &&
                <ul
                    className='mx-4 mb-3 flex flex-col gap-1'>
                    {fetchedAuthor?.info?.affiliations.map((affiliation) =>
                        <li
                            key={affiliation}
                            className='text-xs text-on-surface-muted'>
                            {affiliation}
                        </li>)}
                </ul>
            }
            {
                fetchedAuthor && !originalAuthorIds.some((id) => fetchedAuthor.id === id) &&
                <div
                    className='px-3'>
                    <CheckListButton
                        isSelected={isIncludedAuthor}
                        onClick={onIncludeAllClick}
                        className='w-full text-xs'>
                        <span className='leading-4'>Include {selectedAuthor.person.name} as an original author</span>
                    </CheckListButton>
                </div>
            }
            {
                displayedCommonCoauthors.length > 0 &&
                <section>
                    <SectionHeading
                        popoverContainerRef={popoverContainerRef}
                        info={allIncludedAuthorIds.length > 0 ?
                            `${selectedAuthor.person.name}'s coauthors that are common with an original author` :
                            `${selectedAuthor.person.name}'s coauthors that are in the graph`}>
                        Common coauthors
                    </SectionHeading>
                    <ul
                        className='px-3 py-2 flex flex-col gap-1'>
                        {displayedCommonCoauthors.map((a) =>
                            a &&
                            <AuthorListItem
                                key={a.person.id}
                                onAuthorClick={onCoauthorClick}
                                person={a.person}
                                onHoverChange={onCoauthorHoverChange}
                                after={selectedAuthor.coauthorIds.has(a.person.id) &&
                                    <span> <SamePublicationTag popoverContainerRef={popoverContainerRef} /></span>} />)}
                    </ul>
                </section>
            }
            {
                displayedUncommonCoauthors.length > 0 &&
                <section>
                    {
                        allIncludedAuthorIds.length === 1 && allIncludedAuthorIds[0] === selectedAuthor.person.id ?
                            <SectionHeading>
                                Coauthors
                            </SectionHeading> :
                            <SectionHeading
                                popoverContainerRef={popoverContainerRef}
                                info={allIncludedAuthorIds.length !== 0 ?
                                    `${selectedAuthor.person.name}'s coauthors that are not common with any original author` :
                                    `${selectedAuthor.person.name}'s coauthors that are not in the graph`}>
                                Uncommon coauthors
                            </SectionHeading>
                    }
                    <ul
                        className='px-3 py-2 flex flex-col gap-1'>
                        {displayedUncommonCoauthors.map((a) => {
                            if (!a) {
                                return undefined;
                            }

                            const isInGraph = authorsMap.has(a.id);

                            return (
                                <AuthorListItem
                                    key={a.id}
                                    disabled={!isInGraph}
                                    marker={isInGraph ? 'onhover' : 'none'}
                                    onAuthorClick={(id) => id && authorsMap.has(id) && onCoauthorClick(id)}
                                    person={a}
                                    onHoverChange={onCoauthorHoverChange} />
                            )
                        })}
                    </ul>
                </section>
            }
            <div
                ref={targerObserver}
                className='h-[10px]'
                aria-hidden />
        </div>
}

function SectionHeading({ children, info, popoverContainerRef }: SectionHeadingParams) {
    const {
        isHovered: isPopoverHovered,
        position,
        popoverRef,
        onPointerLeave,
        onPointerMove
    } = usePopoverAnchorHover(popoverContainerRef);
    const isPopoverVisible = useDebounce(isPopoverHovered, 100);

    return (
        <>
            <h5 className='font-bold mx-4 mt-4 text-sm'>
                {children} {info &&
                    <MdInfo
                        onPointerLeave={onPointerLeave}
                        onPointerMove={onPointerMove}
                        className='inline'
                        aria-label={info} />}
            </h5>

            {
                isPopoverHovered &&
                <Popover
                    ref={popoverRef}
                    containerRef={popoverContainerRef}
                    left={position[0]}
                    top={position[1]}
                    className={isPopoverHovered && isPopoverVisible ? 'visible' : 'invisible'}>
                    <div
                        className='px-2 py-1 text-xs'>
                        {info}
                    </div>
                </Popover>
            }
        </>
    )
}

function SamePublicationTag({ popoverContainerRef }: SamePublicationTagParams) {
    const {
        isHovered: isPopoverHovered,
        position,
        popoverRef,
        onPointerLeave,
        onPointerMove
    } = usePopoverAnchorHover(popoverContainerRef);
    const isPopoverVisible = useDebounce(isPopoverHovered, 100);

    return (
        <>
            <MdLibraryBooks
                onPointerLeave={onPointerLeave}
                onPointerMove={onPointerMove}
                className='inline'
                aria-label='Coauthor of the same publication' />
            {
                isPopoverHovered &&
                <Popover
                    ref={popoverRef}
                    containerRef={popoverContainerRef}
                    left={position[0]}
                    top={position[1]}
                    className={isPopoverHovered && isPopoverVisible ? 'visible' : 'invisible'}>
                    <div
                        className='px-2 py-1 text-xs'>
                        Coauthor of the same publication
                    </div>
                </Popover>
            }
        </>
    )
}

function useDisplayedCoauthors(
    targerObserver: RefObject<HTMLDivElement>,
    listRef: RefObject<HTMLDivElement>,
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    fetchedAuthor: DblpAuthor | undefined,
    isIncludedAuthor: boolean,
    allIncludedAuthorIds: Array<string>,
) {
    const { commonCoauthors, uncommonCoauthors } = useCommonUncommonCoauthors(
        authorsMap,
        fetchedAuthor,
        isIncludedAuthor,
        allIncludedAuthorIds
    );
    const [displayedCount, resetDisplayedCount] = useLazyListCount(uncommonCoauthors.length + commonCoauthors.length, COUNT_INCREASE, targerObserver);
    const displayedCommonCoauthors = useMemo(
        () => commonCoauthors.slice(0, displayedCount),
        [commonCoauthors, displayedCount]);
    const displayedUncommonCoauthors = useMemo(
        () => displayedCount > commonCoauthors.length ? uncommonCoauthors.slice(0, displayedCount) : [],
        [uncommonCoauthors, commonCoauthors, displayedCount]);

    useEffect(() => {
        resetDisplayedCount();
        listRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, [fetchedAuthor?.id, listRef, resetDisplayedCount]);

    return {
        displayedCommonCoauthors,
        displayedUncommonCoauthors
    };
}