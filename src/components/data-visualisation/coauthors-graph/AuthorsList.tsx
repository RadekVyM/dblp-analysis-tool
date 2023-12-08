'use client'

import { PublicationPersonNodeDatum } from '@/dtos/PublicationPersonNodeDatum'
import AuthorListItem from './AuthorListItem'
import useLazyListCount from '@/hooks/useLazyListCount'
import { useEffect, useMemo, useRef } from 'react'

type AuthorsListParams = {
    nodes: Array<PublicationPersonNodeDatum>
    onAuthorClick: (id: string | null) => void,
    onAuthorHoverChange: (id: string, isHovered: boolean) => void,
    title: React.ReactNode
}

const COUNT_INCREASE = 60;

export default function AuthorsList({ nodes, title, onAuthorClick, onAuthorHoverChange }: AuthorsListParams) {
    const targerObserver = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [displayedCount, resetDisplayedCount] = useLazyListCount(nodes.length, COUNT_INCREASE, targerObserver);
    const displayedNodes = useMemo(() => nodes.slice(0, displayedCount), [nodes, displayedCount]);

    useEffect(() => {
        resetDisplayedCount();
        listRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, [nodes]);

    return (
        <article
            className='flex flex-col h-full w-full'>
            <h4 className='mx-4 mt-5 mb-4 font-bold'>{title}</h4>
            <ul
                ref={listRef}
                className='flex-1 h-full px-3 py-2 flex flex-col gap-1 overflow-auto thin-scrollbar'>
                {displayedNodes.map((coauthor) =>
                    <AuthorListItem
                        key={coauthor.person.id}
                        person={coauthor.person}
                        onAuthorClick={onAuthorClick}
                        onHoverChange={onAuthorHoverChange} />)}
                <div
                    ref={targerObserver}
                    className='h-[10px]'
                    aria-hidden />
            </ul>
        </article>
    )
}