'use client'

import Tabs from '@/app/(components)/Tabs'
import { DblpPublication } from '@/shared/models/DblpPublication'
import { useEffect, useState } from 'react'
import { PublicationListItem } from './AuthorPublications'
import { PUBLICATION_TYPE_TITLE } from '@/app/(constants)/publications'
import { PublicationType } from '@/shared/enums/PublicationType'
import ListLink from '@/app/(components)/ListLink'
import Button from '@/app/(components)/Button'

type GroupedPublicationsListParams = {
    publications: Array<DblpPublication>
}

type GroupedBy = 'year' | 'type'

const GROUPED_BY_FUNC = {
    'year': byYear,
    'type': byType
} as const

const DEFAULT_VISIBLE_CONTENTS_COUNT = 8;

export default function GroupedPublicationsList({ publications }: GroupedPublicationsListParams) {
    const [groupedPublications, setGroupedPublications] = useState<Map<any, Array<DblpPublication>>>(new Map());
    const [groupedBy, setGroupedBy] = useState<GroupedBy>('year');
    const [contentsLength, setContentsLength] = useState<number | undefined>(DEFAULT_VISIBLE_CONTENTS_COUNT);

    useEffect(() => {
        setGroupedPublications(group(publications, GROUPED_BY_FUNC[groupedBy]));
        setContentsLength(DEFAULT_VISIBLE_CONTENTS_COUNT);
    }, [publications, groupedBy]);

    return (
        <>
            <Tabs
                className='mb-6'
                size='sm'
                items={[
                    { content: 'Group by Year', id: 'year' },
                    { content: 'Group by Type', id: 'type' }
                ]}
                legend='Choose a grouping property'
                selectedId={groupedBy}
                setSelectedId={setGroupedBy}
                tabsId='grouping-selection' />

            <div
                className='mb-8'
                role='navigation'>
                <h4 className='font-semibold mb-4'>Table of contents</h4>
                <ul
                    className='flex flex-col gap-1 mb-3'>
                    {Array.from(groupedPublications.keys(), (key) => key).slice(0, contentsLength).map((key, keyIndex) =>
                        <ListLink
                            key={`contents_${key}`}
                            size='sm'
                            href={`#${getElementId(key)}`}>
                            {groupedBy == 'year' ? key : PUBLICATION_TYPE_TITLE[key as PublicationType]}
                        </ListLink>)}
                </ul>
                {
                    Array.from(groupedPublications.keys(), (key) => key).length > DEFAULT_VISIBLE_CONTENTS_COUNT &&
                    <Button
                        variant='outline' size='xs'
                        onClick={() => setContentsLength((old) => old ? undefined : DEFAULT_VISIBLE_CONTENTS_COUNT)}>
                        {contentsLength ? 'Show more' : 'Show less'}
                    </Button>
                }
            </div>

            <ul
                className='flex flex-col gap-8'>
                {Array.from(groupedPublications.keys(), (key) => key).map((key, keyIndex) => {
                    const keyPublications = groupedPublications.get(key);

                    return (
                        <li
                            key={key}>
                            <header
                                id={getElementId(key)}
                                className='mb-6 flex gap-3 items-center'>
                                <h4
                                    className='font-semibold'>
                                    {groupedBy == 'year' ? key : PUBLICATION_TYPE_TITLE[key as PublicationType]}
                                </h4>
                                <span
                                    title={`${keyPublications?.length} publications`}
                                    className='px-2 py-0.5 text-xs rounded-lg bg-secondary text-on-secondary'>
                                    {keyPublications?.length}
                                </span>
                            </header>
                            <ul
                                className='flex flex-col gap-5 pl-4'>
                                {keyPublications?.map((publ, publIndex) =>
                                    <PublicationListItem
                                        key={publ.id}
                                        publication={publ} />)}
                            </ul>
                        </li>
                    )
                })}
            </ul>
        </>
    )
}

function byYear(publ: DblpPublication) {
    return publ.year
}

function byType(publ: DblpPublication) {
    return publ.type
}

function group(publications: Array<DblpPublication>, by: (publ: DblpPublication) => any) {
    const map = new Map<any, Array<DblpPublication>>();
    publications.forEach((item) => {
        const key = by(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

function getElementId(key: any) {
    return `${key}_section`
}