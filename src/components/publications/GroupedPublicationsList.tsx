'use client'

import { DblpPublication, getVenueTitle } from '@/dtos/DblpPublication'
import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { PUBLICATION_TYPE_TITLE } from '@/constants/client/publications'
import { PublicationType } from '@/enums/PublicationType'
import { group, isGreater, isSmaller } from '@/utils/array'
import { cn } from '@/utils/tailwindUtils'
import useDialog from '@/hooks/useDialog'
import FiltersDialog from '@/components/dialogs/FiltersDialog'
import ItemsStats from '@/components/ItemsStats'
import useLazyListCount from '@/hooks/useLazyListCount'
import usePublicationFilters from '@/hooks/filters/usePublicationFilters'
import FiltersList from '@/components/FiltersList'
import PublicationListItem from './PublicationListItem'
import Badge from '../Badge'
import { DefaultSelectedPublicationsParams } from '@/dtos/DefaultSelectedPublicationsParams'
import PublicationVenuesStats from '../data-visualisation/stats/PublicationVenuesStats'
import { PageSubsectionTitle } from '../shell/PageSection'
import PublicationTypesStats from '../data-visualisation/stats/PublicationTypesStats'
import PublicationsOverTimeStats from '../data-visualisation/stats/PublicationsOverTimeStats'
import filterPublications from '@/services/publications/filters'

type GroupedPublicationsListParams = {
    publications: Array<DblpPublication>,
    additionalPublicationsStats?: (publications: Array<DblpPublication>) => React.ReactNode
} & DefaultSelectedPublicationsParams

type PublicationsListParams = {
    className?: string,
    publications: Array<[any, PublicationGroup]>,
    groupedBy: GroupedBy
}

type PublicationGroup = {
    publications: Array<DblpPublication>,
    count: number
}

type GroupedBy = 'year' | 'type' | 'venue' | 'groupTitle'

const GROUPED_BY_FUNC = {
    'year': byYear,
    'type': byType,
    'venue': byVenue,
    'groupTitle': byGroupTitle,
} as const

const DISPLAYED_COUNT_INCREASE = 25;

/** Displays a list of publications that can be filtered. */
export default function GroupedPublicationsList({
    publications,
    defaultSelectedYears,
    defaultSelectedTypes,
    defaultSelectedVenueIds,
    defaultSelectedAuthors,
    additionalPublicationsStats
}: GroupedPublicationsListParams) {
    const observerTarget = useRef<HTMLDivElement>(null);
    const groupedBy = useMemo(() => {
        const groupTitles = new Set<string | null>();
        publications.forEach((p) => groupTitles.add(p.groupTitle));
        return groupTitles.size > 1 ? 'groupTitle' : 'year';
    }, [publications]);
    const [filtersDialog, isFiltersDialogOpen, filtersDialogAnimation, showFiltersDialog, hideFiltersDialog] = useDialog();
    const {
        filteredPublications,
        displayedPublications,
        displayedPublicationsCount,
        filtersMap,
        switchFilterSelection,
        clearFilters
    } = useDisplayedPublications(
        publications,
        groupedBy,
        observerTarget,
        {
            years: defaultSelectedYears,
            types: defaultSelectedTypes,
            venues: defaultSelectedVenueIds,
            authors: defaultSelectedAuthors
        });

    return (
        <>
            <FiltersDialog
                filtersMap={filtersMap}
                clear={clearFilters}
                switchSelection={switchFilterSelection}
                hide={hideFiltersDialog}
                animation={filtersDialogAnimation}
                isOpen={isFiltersDialogOpen}
                ref={filtersDialog} />

            <ItemsStats
                className='mb-6'
                totalCount={publications.length}
                displayedCount={displayedPublicationsCount} />

            <FiltersList
                className='mb-8'
                showFiltersDialog={showFiltersDialog}
                filtersMap={filtersMap}
                switchSelection={switchFilterSelection}
                clear={clearFilters} />

            <PageSubsectionTitle>Publication Types</PageSubsectionTitle>

            <PublicationTypesStats
                scaffoldId='publication-types-stats'
                className='mb-10'
                publications={filteredPublications.map((publ) => ({
                    id: publ.id,
                    type: publ.type,
                    date: publ.date
                }))} />

            <PageSubsectionTitle>Publications Over Time</PageSubsectionTitle>

            <PublicationsOverTimeStats
                scaffoldId='publications-over-time-stats'
                className='mb-10'
                publications={filteredPublications.map((publ) => ({
                    id: publ.id,
                    type: publ.type,
                    year: publ.year
                }))} />

            <PageSubsectionTitle>Publication Venues</PageSubsectionTitle>

            <PublicationVenuesStats
                scaffoldId='publication-venues-stats'
                className='mb-10'
                publications={filteredPublications.map((publ) => ({
                    id: publ.id,
                    type: publ.type,
                    venueId: publ.venueId || null,
                    venueTitle: getVenueTitle(publ)
                }))} />

            {additionalPublicationsStats && additionalPublicationsStats(filteredPublications)}

            <PublicationsList
                groupedBy={groupedBy}
                publications={displayedPublications} />

            <div ref={observerTarget}></div>
        </>
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
                            <PageSubsectionTitle
                                className='m-0'>
                                {getTitleFromKey(key, groupedBy)}
                            </PageSubsectionTitle>
                            <Badge
                                title={`${keyPublications.count} publications`}>
                                {keyPublications.count}
                            </Badge>
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

/** Hook that manages currently displayed publications. */
function useDisplayedPublications(
    publications: Array<DblpPublication>,
    groupedBy: GroupedBy,
    observerTarget: RefObject<HTMLDivElement>,
    defaultSelected?: {
        types?: Array<PublicationType>,
        /** Venue IDs */
        venues?: Array<string | undefined>,
        years?: Array<number>,
        /** Author IDs */
        authors?: Array<string>
    }
) {
    const [groupedPublications, setGroupedPublications] = useState<Array<[any, Array<DblpPublication>]>>([]);
    const [totalCount, setTotalCount] = useState(publications.length);
    const [displayedCount, resetDisplayedCount] = useLazyListCount(totalCount, DISPLAYED_COUNT_INCREASE, observerTarget);
    const { filtersMap, typesFilter, venuesFilter, yearsFilter, authorsFilter, switchSelection, clear } = usePublicationFilters(
        publications,
        undefined,
        defaultSelected);
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
    const displayedPublicationsCount = useMemo(() => groupedPublications.reduce((prev, current) => prev + current[1].length, 0), [groupedPublications]);
    const filteredPublications = useMemo(() => groupedPublications.flatMap((g) => g[1]), [groupedPublications]);

    useEffect(() => {
        if (!typesFilter || !venuesFilter || !yearsFilter || !authorsFilter) {
            return;
        }

        const selectedTypes = typesFilter.selectedItems;
        const selectedVenues = venuesFilter.selectedItems;
        const selectedYears = yearsFilter.selectedItems;
        const selectedAuthors = authorsFilter.selectedItems;

        const publs = filterPublications(publications, selectedTypes, selectedVenues, selectedYears, selectedAuthors);
        publs.sort((p1, p2) => isSmaller(p1.year, p2.year));
        const grouped = [...group<any, DblpPublication>(publs, GROUPED_BY_FUNC[groupedBy])];
        grouped.sort(([key1], [key2]) => isSmaller(key1, key2));

        setGroupedPublications(grouped);
        setTotalCount(publs.length);
        resetDisplayedCount();
    }, [publications, groupedBy, typesFilter, venuesFilter, yearsFilter, authorsFilter, resetDisplayedCount]);

    return {
        filteredPublications,
        displayedPublications,
        displayedPublicationsCount,
        filtersMap,
        switchFilterSelection: switchSelection,
        clearFilters: clear
    };
}

function byYear(publ: DblpPublication) {
    return publ.year;
}

function byType(publ: DblpPublication) {
    return publ.type;
}

function byVenue(publ: DblpPublication) {
    return publ.journal || publ.booktitle;
}

function byGroupTitle(publ: DblpPublication) {
    return publ.groupTitle;
}

function getTitleFromKey(key: any, groupedBy: GroupedBy) {
    switch (groupedBy) {
        case 'type':
            return PUBLICATION_TYPE_TITLE[key as PublicationType];
        case 'year':
            return key;
        case 'venue':
            return key || 'Unlisted Publications';
        case 'groupTitle':
            return key || 'Ungrouped Publications';
    }
}

function getElementId(key: any) {
    return `${key}_section`;
}