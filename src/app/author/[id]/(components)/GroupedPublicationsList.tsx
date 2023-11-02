'use client'

import { DblpPublication } from '@/dtos/DblpPublication'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PublicationListItem } from './AuthorPublications'
import { PUBLICATION_TYPE_TITLE } from '@/constants/client/publications'
import { PublicationType } from '@/enums/PublicationType'
import { MdCancel, MdFilterListAlt } from 'react-icons/md'
import { group } from '@/utils/array'
import { cn } from '@/utils/tailwindUtils'
import useDialog from '@/hooks/useDialog'
import { PublicationFiltersDialog } from '@/components/PublicationFiltersDialog'
import ItemsStats from '@/components/ItemsStats'
import Button from '@/components/Button'
import ListLink from '@/components/ListLink'

type GroupedPublicationsListParams = {
    publications: Array<DblpPublication>
}

type ContentsTableParams = {
    keys: Array<any>,
    groupedBy: GroupedBy
}

type FilterItemParams = {
    onClick: () => void,
    children: React.ReactNode
}

type FiltersListParams = {
    className?: string,
    selectedTypes: Array<PublicationType>,
    selectedVenues: Array<string | undefined>,
    venuesMap: Map<string | undefined, string>,
    deselectType: (type: PublicationType) => void,
    deselectVenue: (venueId: string | undefined) => void,
    showFiltersDialog: () => void
}

type PublicationsListParams = {
    className?: string,
    publications: Array<[any, PublicationGroup]>,
    groupedBy: GroupedBy
}

type PublicationGroup = {
    publications: Array<DblpPublication>,
    count: number
}

type GroupedBy = 'year' | 'type' | 'venue'

const GROUPED_BY_FUNC = {
    'year': byYear,
    'type': byType,
    'venue': byVenue,
} as const

const DEFAULT_VISIBLE_CONTENTS_COUNT = 8;
const DISPLAYED_COUNT_INCREASE = 25;

export default function GroupedPublicationsList({ publications }: GroupedPublicationsListParams) {
    const [groupedPublications, setGroupedPublications] = useState<Array<[any, Array<DblpPublication>]>>([]);
    const [groupedBy, setGroupedBy] = useState<GroupedBy>('year');
    const [filtersDialog, isFiltersDialogOpen, filtersDialogAnimation, showFiltersDialog, hideFiltersDialog] = useDialog();
    const [selectedTypes, setSelectedTypes] = useState(new Set<PublicationType>([]));
    const [selectedVenues, setSelectedVenues] = useState(new Set<string | undefined>([]));
    const [displayedCount, setDisplayedCount] = useState(DISPLAYED_COUNT_INCREASE);
    const [totalCount, setTotalCount] = useState(publications.length);
    const observerTarget = useRef<HTMLDivElement>(null);

    const venuesMap = useMemo(() => {
        const map = new Map<string | undefined, string>();

        for (const publ of publications) {
            map.set(publ.venueId, publ.venueId ? publ.journal || publ.booktitle || 'undefined' : 'Not Listed Publications');
        }

        return map;
    }, [publications]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setDisplayedCount((oldCount) => {
                        const newCount = oldCount + DISPLAYED_COUNT_INCREASE;
                        return totalCount > oldCount ? newCount : oldCount;
                    });
                }
            },
            { threshold: 0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        }
    }, [observerTarget]);

    useEffect(() => {
        const publs = publications.filter((publ) =>
            (selectedTypes.size == 0 || selectedTypes.has(publ.type)) && (selectedVenues.size == 0 || selectedVenues.has(publ.venueId)));
        setGroupedPublications([...group<any, DblpPublication>(publs, GROUPED_BY_FUNC[groupedBy])]);
        setTotalCount(publs.length);
        setDisplayedCount(DISPLAYED_COUNT_INCREASE);
    }, [publications, groupedBy, selectedTypes, selectedVenues]);

    const displayedPublications = useMemo(() => {
        let count = displayedCount;
        const newDisplayedPublications: Array<[any, PublicationGroup]> = [];

        for (const [key, publications] of groupedPublications) {
            if (count <= 0) {
                break;
            }

            const newPair: [any, PublicationGroup] = [
                key,
                {
                    publications: publications.slice(0, count > publications.length ? undefined : count),
                    count: publications.length
                }
            ];

            newDisplayedPublications.push(newPair);

            count -= publications.length;
        }

        return newDisplayedPublications;
    }, [groupedPublications, displayedCount]);

    function deselectType(type: PublicationType) {
        setSelectedTypes(types => new Set([...types].filter((t) => t != type)));
        const venues = new Set(publications.filter((p) => p.type == type).map((p) => p.venueId));
        setSelectedVenues((currentlySelected) =>
            new Set([...currentlySelected].filter((v) => !venues.has(v))));
    }

    function deselectVenue(venue: string | undefined) {
        setSelectedVenues(venues => new Set([...venues].filter((v) => v != venue)))
    }

    return (
        <>
            <PublicationFiltersDialog
                publications={publications}
                selectedTypes={selectedTypes}
                selectedVenues={selectedVenues}
                venuesMap={venuesMap}
                onSubmit={(types, venues) => {
                    setSelectedTypes(types);
                    setSelectedVenues(venues);
                }}
                hide={hideFiltersDialog}
                animation={filtersDialogAnimation}
                isOpen={isFiltersDialogOpen}
                ref={filtersDialog} />

            <ItemsStats
                className='mb-6'
                totalCount={publications.length}
                displayedCount={groupedPublications.reduce((prev, current) => prev + current[1].length, 0)} />

            <FiltersList
                className='mb-8'
                deselectType={deselectType}
                deselectVenue={deselectVenue}
                selectedTypes={[...selectedTypes.values()]}
                selectedVenues={[...selectedVenues.values()]}
                showFiltersDialog={showFiltersDialog}
                venuesMap={venuesMap} />

            <PublicationsList
                groupedBy={groupedBy}
                publications={displayedPublications} />

            <div ref={observerTarget}></div>
        </>
    )
}

function FiltersList({ className, selectedTypes, selectedVenues, venuesMap, deselectType, deselectVenue, showFiltersDialog }: FiltersListParams) {
    return (
        <ul
            className={cn('flex gap-2 flex-wrap mb-8', className)}>
            <li>
                <Button
                    className='items-center gap-2'
                    variant='outline' size='xs'
                    onClick={() => showFiltersDialog()}>
                    <MdFilterListAlt />
                    Add Filters
                </Button>
            </li>
            {selectedTypes.map((type) =>
                <FilterItem
                    key={`type-filter-${type}`}
                    onClick={() => deselectType(type)}>
                    {PUBLICATION_TYPE_TITLE[type]}
                </FilterItem>)}
            {selectedVenues.map((venue) =>
                <FilterItem
                    key={`venue-filter-${venue}`}
                    onClick={() => deselectVenue(venue)}>
                    {venuesMap.get(venue)}
                </FilterItem>)}
        </ul>
    )
}

function FilterItem({ onClick, children }: FilterItemParams) {
    return (
        <li>
            <Button
                className='items-center gap-2'
                variant='outline' size='xs'
                onClick={onClick}>
                {children}
                <MdCancel />
            </Button>
        </li>
    )
}

function PublicationsList({ publications, groupedBy, className }: PublicationsListParams) {
    return (
        <ul
            className={cn('flex flex-col gap-8 isolate', className)}>
            {publications.map((group, keyIndex) => {
                const key = group[0];
                const keyPublications = group[1];

                return (
                    <li
                        key={key || getTitleFromKey(key, groupedBy)}>
                        <header
                            id={getElementId(key)}
                            className='mb-6 flex gap-3 items-center'>
                            <h4
                                className='font-semibold'>
                                {getTitleFromKey(key, groupedBy)}
                            </h4>
                            <span
                                title={`${keyPublications.count} publications`}
                                className='px-2 py-0.5 text-xs rounded-lg bg-secondary text-on-secondary'>
                                {keyPublications.count}
                            </span>
                        </header>
                        <ul
                            className='flex flex-col gap-5 pl-4'>
                            {keyPublications.publications.map((publ, publIndex) =>
                                <PublicationListItem
                                    key={publ.id}
                                    publication={publ} />)}
                        </ul>
                    </li>
                )
            })}
        </ul>
    )
}

function ContentsTable({ keys, groupedBy }: ContentsTableParams) {
    const [contentsLength, setContentsLength] = useState<number | undefined>(DEFAULT_VISIBLE_CONTENTS_COUNT);

    return (
        <div
            className='mb-8'
            role='navigation'>
            <h4 className='font-semibold mb-4'>Table of contents</h4>
            <ul
                className='flex flex-col gap-1 mb-3'>
                {Array.from(keys, (key) => key).slice(0, contentsLength).map((key, keyIndex) =>
                    <ListLink
                        key={`contents_${key}`}
                        size='sm'
                        href={`#${getElementId(key)}`}>
                        {getTitleFromKey(key, groupedBy)}
                    </ListLink>)}
            </ul>
            {
                Array.from(keys, (key) => key).length > DEFAULT_VISIBLE_CONTENTS_COUNT &&
                <Button
                    variant='outline' size='xs'
                    onClick={() => setContentsLength((old) => old ? undefined : DEFAULT_VISIBLE_CONTENTS_COUNT)}>
                    {contentsLength ? 'Show more' : 'Show less'}
                </Button>
            }
        </div>
    )
}

function byYear(publ: DblpPublication) {
    return publ.year
}

function byType(publ: DblpPublication) {
    return publ.type
}

function byVenue(publ: DblpPublication) {
    return publ.journal || publ.booktitle
}

function getTitleFromKey(key: any, groupedBy: GroupedBy) {
    switch (groupedBy) {
        case 'type':
            return PUBLICATION_TYPE_TITLE[key as PublicationType];
        case 'year':
            return key;
        case 'venue':
            return key || 'Not Listed Publications';
    }
}

function getElementId(key: any) {
    return `${key}_section`
}