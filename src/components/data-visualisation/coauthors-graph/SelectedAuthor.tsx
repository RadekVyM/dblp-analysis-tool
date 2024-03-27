'use client'

import CheckListButton from '@/components/inputs/CheckListButton'
import AuthorListItem from './AuthorListItem'
import LoadingWheel from '@/components/LoadingWheel'
import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
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
import Badge from '@/components/Badge'
import { searchIncludes, splitSearchQuery, stify } from '@/utils/strings'
import InfoBadge from './InfoBadge'
import SaveAuthorButtons from '@/components/authors/SaveAuthorButtons'
import SearchBox from '@/components/inputs/SearchBox'
import { personNodeMatchesSearchPhrases } from '@/services/graphs/authors'

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
    count?: number,
    countTitle?: string,
    popoverContainerRef?: React.RefObject<HTMLDivElement>,
}

type CommonPublicationsCountParams = {
    popoverContainerRef?: React.RefObject<HTMLDivElement>,
    selectedAuthor: PublicationPersonNodeDatum,
    coauthorId: string,
    isIncludedAuthor: boolean,
    allIncludedAuthorIds: Array<string>
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
    const {
        displayedCommonCoauthors,
        displayedUncommonCoauthors,
        commonCoauthorsCount,
        uncommonCoauthorsCount,
        searchQuery,
        onSearchQueryChange
    } = useDisplayedCoauthors(
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
                fetchedAuthor &&
                <SaveAuthorButtons
                    className='mx-4 mb-3'
                    buttonSize='xs'
                    exportButtonDisabled
                    author={fetchedAuthor} />
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
                (commonCoauthorsCount > 0 || uncommonCoauthorsCount > 0) &&
                <div
                    className='sticky top-0 bg-surface-container z-30 mx-4 pb-1 mt-4'>
                    <SearchBox
                        placeholder='Search coauthors...'
                        searchQuery={searchQuery}
                        onSearchQueryChange={onSearchQueryChange} />
                </div>
            }
            {
                displayedCommonCoauthors.length > 0 &&
                <section>
                    <SectionHeading
                        popoverContainerRef={popoverContainerRef}
                        info={allIncludedAuthorIds.length > 0 ?
                            `${selectedAuthor.person.name}'s coauthors that are common with an original author` :
                            `${selectedAuthor.person.name}'s coauthors that are in the graph`}
                        count={commonCoauthorsCount}
                        countTitle={`${commonCoauthorsCount} common ${stify('coauthor', commonCoauthorsCount)}`}>
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
                                    <span> <CommonPublicationsCount
                                        popoverContainerRef={popoverContainerRef}
                                        allIncludedAuthorIds={allIncludedAuthorIds}
                                        isIncludedAuthor={isIncludedAuthor}
                                        selectedAuthor={selectedAuthor}
                                        coauthorId={a.person.id} />
                                    </span>} />)}
                    </ul>
                </section>
            }
            {
                displayedUncommonCoauthors.length > 0 &&
                <section>
                    {
                        allIncludedAuthorIds.length === 1 && allIncludedAuthorIds[0] === selectedAuthor.person.id ?
                            <SectionHeading
                                popoverContainerRef={popoverContainerRef}
                                count={uncommonCoauthorsCount}
                                countTitle={`${uncommonCoauthorsCount} ${stify('coauthor', uncommonCoauthorsCount)}`}>
                                Coauthors
                            </SectionHeading> :
                            <SectionHeading
                                popoverContainerRef={popoverContainerRef}
                                info={allIncludedAuthorIds.length !== 0 ?
                                    `${selectedAuthor.person.name}'s coauthors that are not common with any original author` :
                                    `${selectedAuthor.person.name}'s coauthors that are not in the graph`}
                                count={uncommonCoauthorsCount}
                                countTitle={`${uncommonCoauthorsCount} uncommon ${stify('coauthor', uncommonCoauthorsCount)}`}>
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
                                    onHoverChange={onCoauthorHoverChange}
                                    after={selectedAuthor.coauthorIds.has(a.id) &&
                                        <span> <CommonPublicationsCount
                                            popoverContainerRef={popoverContainerRef}
                                            allIncludedAuthorIds={allIncludedAuthorIds}
                                            isIncludedAuthor={isIncludedAuthor}
                                            selectedAuthor={selectedAuthor}
                                            coauthorId={a.id} />
                                        </span>} />
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

function SectionHeading({ children, info, count, countTitle, popoverContainerRef }: SectionHeadingParams) {
    return (
        <h5 className='font-bold mx-4 mt-3 text-sm'>
            {children} {info &&
                <InfoBadge
                    info={info}
                    popoverContainerRef={popoverContainerRef} />} {count &&
                        <Badge
                            className='ml-2'
                            popoverContainerRef={popoverContainerRef}
                            title={countTitle}>
                            {count}
                        </Badge>}
        </h5>
    )
}

function CommonPublicationsCount({ selectedAuthor, coauthorId, isIncludedAuthor, allIncludedAuthorIds, popoverContainerRef }: CommonPublicationsCountParams) {
    const count = selectedAuthor.coauthorIds.get(coauthorId);
    const shouldNotIncludeLongText = isIncludedAuthor || allIncludedAuthorIds.some((id) => id === coauthorId);

    return (
        <Badge
            className='inline-block mb-[0.2rem] ml-1 align-middle'
            popoverContainerRef={popoverContainerRef}
            title={`${count} common ${stify('publication', count)}${shouldNotIncludeLongText ? '' : ', all authors of which are included in the graph'}`}
            isMicro>
            {count}
        </Badge>
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
    const [searchQuery, setSearchQuery] = useState('');
    const { commonCoauthors, uncommonCoauthors } = useCommonUncommonCoauthors(
        authorsMap,
        fetchedAuthor,
        isIncludedAuthor,
        allIncludedAuthorIds
    );
    const searchPhrases = useMemo(() => splitSearchQuery(searchQuery), [searchQuery]);
    const filteredCommonCoauthors = useMemo(
        () => commonCoauthors
            .filter((node) => node && personNodeMatchesSearchPhrases(node, searchPhrases)),
        [commonCoauthors, searchPhrases]);
    const filteredUncommonCoauthors = useMemo(
        () => uncommonCoauthors
            .filter((node) => searchIncludes(node.name, ...searchPhrases)),
        [uncommonCoauthors, searchPhrases]);
    const [displayedCount, resetDisplayedCount] = useLazyListCount(filteredUncommonCoauthors.length + filteredCommonCoauthors.length, COUNT_INCREASE, targerObserver);
    const displayedCommonCoauthors = useMemo(
        () => filteredCommonCoauthors.slice(0, displayedCount),
        [filteredCommonCoauthors, displayedCount]);
    const displayedUncommonCoauthors = useMemo(
        () => displayedCount > filteredCommonCoauthors.length ?
            filteredUncommonCoauthors.slice(0, displayedCount) :
            [],
        [filteredUncommonCoauthors, filteredCommonCoauthors.length, displayedCount]);

    useEffect(() => {
        setSearchQuery('');
        resetDisplayedCount();
        listRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, [fetchedAuthor?.id, listRef, resetDisplayedCount]);

    useEffect(() => {
        resetDisplayedCount();
    }, [searchQuery]);

    return {
        displayedCommonCoauthors,
        displayedUncommonCoauthors,
        commonCoauthorsCount: filteredCommonCoauthors.length,
        uncommonCoauthorsCount: filteredUncommonCoauthors.length,
        searchQuery,
        onSearchQueryChange: setSearchQuery,
    };
}