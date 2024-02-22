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
import { getUniqueCoauthors } from '@/services/graphs/authors'
import useAuthor from '@/hooks/authors/useAuthor'
import useLazyListCount from '@/hooks/useLazyListCount'

const COUNT_INCREASE = 60;

type SelectedAuthorParams = {
    onBackClick: () => void,
} & SelectedAuthorContentParams

type SelectedAuthorContentParams = {
    originalAuthorIds: Array<string>,
    allIncludedAuthorIds: Array<string>,
    ignoredAuthorIds?: Array<string>,
    selectedAuthor: PublicationPersonNodeDatum,
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    addAuthor: (author: DblpAuthor) => void,
    removeAuthor: (id: string) => void,
    onCoauthorClick: (id: string | null) => void,
    onCoauthorHoverChange: (id: string, isHovered: boolean) => void
}

/** Displays basic information about currently selected author in the coauthors graph and their coauthors.  */
export default function SelectedAuthor({
    selectedAuthor,
    authorsMap,
    ignoredAuthorIds,
    allIncludedAuthorIds,
    originalAuthorIds,
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
                ignoredAuthorIds={ignoredAuthorIds}
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
    ignoredAuthorIds,
    allIncludedAuthorIds,
    originalAuthorIds,
    addAuthor,
    removeAuthor,
    onCoauthorClick,
    onCoauthorHoverChange
}: SelectedAuthorContentParams) {
    const targerObserver = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const { author: fetchedAuthor, error, isLoading } = useAuthor(selectedAuthor.person.id);
    const isIncludedAuthor = useMemo(() => allIncludedAuthorIds.some((id) => id === selectedAuthor.person.id), [allIncludedAuthorIds, selectedAuthor]);
    const { displayedCommonCoauthors, displayedUncommonCoauthors } = useDisplayedCoauthors(
        targerObserver,
        listRef,
        authorsMap,
        selectedAuthor,
        fetchedAuthor,
        isIncludedAuthor,
        allIncludedAuthorIds,
        ignoredAuthorIds);

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
                        className='w-full'>
                        <span className='leading-4'>Include all {selectedAuthor.person.name}&apos;s coauthors in the graph</span>
                    </CheckListButton>
                </div>
            }
            {
                displayedCommonCoauthors.length > 0 &&
                <section>
                    <h5 className='font-bold mx-4 mt-4 text-sm'>Common coauthors</h5>
                    <ul
                        className='px-3 py-2 flex flex-col gap-1'>
                        {displayedCommonCoauthors.map((a) =>
                            a &&
                            <AuthorListItem
                                key={a.person.id}
                                onAuthorClick={onCoauthorClick}
                                person={a.person}
                                onHoverChange={onCoauthorHoverChange} />)}
                    </ul>
                </section>
            }
            {
                displayedUncommonCoauthors.length > 0 &&
                <section>
                    <h5 className='font-bold mx-4 mt-4 text-sm'>Uncommon coauthors</h5>
                    <ul
                        className='px-3 py-2 flex flex-col gap-1'>
                        {displayedUncommonCoauthors.map((a) =>
                            a &&
                            <AuthorListItem
                                key={a.id}
                                onAuthorClick={(id) => id && authorsMap.has(id) && onCoauthorClick(id)}
                                person={a}
                                onHoverChange={onCoauthorHoverChange} />)}
                    </ul>
                </section>
            }
            <div
                ref={targerObserver}
                className='h-[10px]'
                aria-hidden />
        </div>
}

function useDisplayedCoauthors(
    targerObserver: RefObject<HTMLDivElement>,
    listRef: RefObject<HTMLDivElement>,
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    selectedAuthor: PublicationPersonNodeDatum,
    fetchedAuthor: DblpAuthor | undefined,
    isIncludedAuthor: boolean,
    allIncludedAuthorIds: Array<string>,
    ignoredAuthorIds?: Array<string>,
) {
    const commonCoauthors = useMemo(() =>
        isIncludedAuthor ?
            [...selectedAuthor.coauthorIds.values()]
                .map((id) => authorsMap.get(id))
                .filter((a) => a && allIncludedAuthorIds.some((id) => id !== selectedAuthor.person.id && a.coauthorIds.has(id))) :
            [...selectedAuthor.coauthorIds.values()]
                .map((id) => authorsMap.get(id))
                .filter((a) => a && !ignoredAuthorIds?.includes(a.person.id)),
        [selectedAuthor, authorsMap, ignoredAuthorIds, allIncludedAuthorIds, isIncludedAuthor]);
    const uncommonCoauthors = useMemo(() => {
        if (!fetchedAuthor?.publications) {
            return [];
        }

        if (isIncludedAuthor) {
            return getUniqueCoauthors([fetchedAuthor], [], (a) => {
                const author = authorsMap.get(a.id);
                return allIncludedAuthorIds.some((id) => id !== selectedAuthor.person.id && author?.coauthorIds.has(id));
            });
        }

        return getUniqueCoauthors([fetchedAuthor], [], (a) => a.id === selectedAuthor.person.id || authorsMap.has(a.id));
    }, [fetchedAuthor, selectedAuthor, authorsMap, isIncludedAuthor]);
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
    }, [selectedAuthor.person.id]);

    return {
        displayedCommonCoauthors,
        displayedUncommonCoauthors
    };
}