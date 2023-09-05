'use client'

import Tabs from '@/app/(components)/Tabs'
import { DblpPublication } from '@/shared/models/DblpPublication'
import { useEffect, useState } from 'react'
import { PublicationListItem } from './AuthorPublications'
import { PUBLICATION_TYPE_TITLE } from '@/app/(constants)/publications'
import { PublicationType } from '@/shared/enums/PublicationType'

type GroupedPublicationsListParams = {
    publications: Array<DblpPublication>
}

type GroupedBy = 'year' | 'type'

const GROUPED_BY_FUNC = {
    'year': byYear,
    'type': byType
} as const

export default function GroupedPublicationsList({ publications }: GroupedPublicationsListParams) {
    const [groupedPublications, setGroupedPublications] = useState<Map<any, Array<DblpPublication>>>(new Map());
    const [groupedBy, setGroupedBy] = useState<GroupedBy>('year');

    useEffect(() => {
        setGroupedPublications(group(publications, GROUPED_BY_FUNC[groupedBy]));
    }, [publications, groupedBy]);

    return (
        <>
            <Tabs
                className='mb-6'
                items={[
                    { content: 'By Year', id: 'year' },
                    { content: 'By Type', id: 'type' }
                ]}
                legend='Choose a grouping property'
                selectedId={groupedBy}
                setSelectedId={setGroupedBy}
                tabsId='grouping-selection' />

            <ul
                className='flex flex-col gap-8'>
                {Array.from(groupedPublications.keys(), (key) => key).map((key, keyIndex) => {
                    const keyPublications = groupedPublications.get(key);

                    return (
                        <li
                            key={key}>
                            <h4 className='font-semibold mb-6'>{groupedBy == 'year' ? key : PUBLICATION_TYPE_TITLE[key as PublicationType]} ({keyPublications?.length})</h4>
                            <ul
                                className='flex flex-col gap-4 pl-4'>
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