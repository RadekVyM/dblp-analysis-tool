'use client'

import CheckListButton from '@/components/CheckListButton'
import AuthorListItem from './AuthorListItem'
import LoadingWheel from '@/components/LoadingWheel'
import { useEffect, useMemo, useRef } from 'react'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import LinkArrow from '@/components/LinkArrow'
import Link from 'next/link'
import { HiArrowNarrowLeft } from 'react-icons/hi'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import { PublicationPersonNodeDatum } from '@/dtos/PublicationPersonNodeDatum'
import { getUniqueCoauthors } from '@/services/graphs/authors'
import useAuthor from '@/hooks/authors/useAuthor'
import useLazyListCount from '@/hooks/useLazyListCount'

const COUNT_INCREASE = 60;

type SelectedAuthorParams = {
    onBackClick: () => void,
} & SelectedAuthorContentParams

type SelectedAuthorContentParams = {
    allAuthorIds: Array<string>,
    ignoredAuthorIds?: Array<string>,
    selectedAuthor: PublicationPersonNodeDatum,
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    addAuthor: (author: DblpAuthor) => void,
    removeAuthor: (id: string) => void,
    onCoauthorClick: (id: string | null) => void,
    onCoauthorHoverChange: (id: string, isHovered: boolean) => void
}

export default function SelectedAuthor({
    selectedAuthor,
    authorsMap,
    ignoredAuthorIds,
    allAuthorIds,
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
                allAuthorIds={allAuthorIds}
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
    allAuthorIds,
    addAuthor,
    removeAuthor,
    onCoauthorClick,
    onCoauthorHoverChange
}: SelectedAuthorContentParams) {
    const targerObserver = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const { author: fetchedAuthor, error, isLoading } = useAuthor(selectedAuthor.person.id);
    const commonCoauthors = useMemo(() =>
        [...selectedAuthor.coauthorIds.values()]
            .map((id) => authorsMap.get(id))
            .filter((a) => a && !ignoredAuthorIds?.includes(a.person.id)),
        [selectedAuthor, authorsMap, ignoredAuthorIds]);
    const uncommonCoauthors = useMemo(() => {
        if (!fetchedAuthor?.publications) {
            return [];
        }

        return getUniqueCoauthors([fetchedAuthor], (a) => a.id === selectedAuthor.person.id || authorsMap.has(a.id));
    }, [fetchedAuthor, selectedAuthor, authorsMap]);
    const isSelected = allAuthorIds.some((id) => id === selectedAuthor.person.id);
    const [displayedCount, resetDisplayedCount] = useLazyListCount(uncommonCoauthors.length + commonCoauthors.length, COUNT_INCREASE, targerObserver);
    const displayedCommonCoauthors = useMemo(
        () => commonCoauthors.slice(0, displayedCount),
        [commonCoauthors, displayedCount]);
    const displayedUncommonCoauthors = useMemo(
        () => displayedCount > commonCoauthors.length ? uncommonCoauthors.slice(0, displayedCount) : [],
        [uncommonCoauthors, commonCoauthors, displayedCount]);

    function onIncludeAllClick() {
        if (!fetchedAuthor) {
            return
        }

        if (isSelected) {
            removeAuthor(fetchedAuthor.id);
        }
        else {
            addAuthor(fetchedAuthor);
        }
    }

    useEffect(() => {
        resetDisplayedCount();
        listRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, [selectedAuthor.person.id]);

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
                <div
                    className='px-3'>
                    <CheckListButton
                        isSelected={isSelected}
                        onClick={onIncludeAllClick}
                        className='w-full'>
                        <span className='leading-4'>Include all {selectedAuthor.person.name}&apos;s coauthors in the graph</span>
                    </CheckListButton>
                </div>
            }
            {
                displayedCommonCoauthors.length > 0 &&
                <section>
                    <h5 className='font-bold mx-4 mt-4 text-sm'>Common Coauthors</h5>
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
                    <h5 className='font-bold mx-4 mt-4 text-sm'>Uncommon Coauthors</h5>
                    <ul
                        className='px-3 py-2 flex flex-col gap-1'>
                        {displayedUncommonCoauthors.map((a) =>
                            a &&
                            <AuthorListItem
                                key={a.id}
                                onAuthorClick={(id) => { }}
                                person={a}
                                onHoverChange={(id) => { }} />)}
                    </ul>
                </section>
            }
            <div
                ref={targerObserver}
                className='h-[10px]'
                aria-hidden />
        </div>
}
