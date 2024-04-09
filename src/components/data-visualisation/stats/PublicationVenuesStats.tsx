'use client'

import BarChart, { BarChartData } from '@/components/data-visualisation/charts/BarChart'
import ChartUnitSelection from '@/components/data-visualisation/ChartUnitSelection'
import StatsScaffold from '@/components/data-visualisation/StatsScaffold'
import { ChartUnit } from '@/enums/ChartUnit'
import { PublicationType } from '@/enums/PublicationType'
import { isSmaller } from '@/utils/array'
import { cn } from '@/utils/tailwindUtils'
import { useState, useMemo } from 'react'
import { MdBarChart, MdTableChart } from 'react-icons/md'
import CountPercentageTable from '@/components/data-visualisation/CountPercentageTable'
import useSelectedChartUnit from '@/hooks/data-visualisation/useSelectedChartUnit'
import { createLocalPath, getVenueTypeFromDblpString } from '@/utils/urls'
import { VENUE_TYPE_COLOR } from '@/constants/publications'
import ItemsStats from '@/components/ItemsStats'
import CountInput from '../CountInput'
import { sortByPresentedContent } from '@/utils/table'
import { ChartValue } from '@/dtos/data-visualisation/ChartValue'
import { useRouter } from 'next/navigation'
import { toVenuesSearchParamsString } from '@/utils/publicationsSearchParams'
import { SearchType } from '@/enums/SearchType'
import { VenueType } from '@/enums/VenueType'
import PublicationTypesPopoverContent from './PublicationTypesPopoverContent'
import * as d3 from 'd3'

type VenuePublication = {
    id: string,
    type: PublicationType,
    venueId: string | null,
    venueTitle: string,
    seriesId?: string | null,
    seriesTitle?: string | null,
}

type PublicationVenuesStatsParams = {
    className?: string,
    publications: Array<VenuePublication>,
    scaffoldId?: string,
    publicationsUrl?: string,
}

type PublicationVenuesBarChartParams = {
    selectedUnit: ChartUnit,
    maxBarsCount: number,
    onBarClick?: (key: any, value?: ChartValue) => void,
} & PublicationVenuesStatsParams

type PublicationVenuesTableParams = {
    venues: Array<VenuePair>
} & PublicationVenuesStatsParams

type VenuePair = { venueId: string | null, title: string }

/** Displays publications statistics by venues. */
export default function PublicationVenuesStats({ className, publications, scaffoldId, publicationsUrl }: PublicationVenuesStatsParams) {
    const [selectedPublTypesStatsVisual, setSelectedPublTypesStatsVisual] = useState('Bars');
    const [barChartSelectedUnit, setBarChartSelectedUnit] = useSelectedChartUnit();
    const [maxBarsCount, setMaxBarsCount] = useState(100);
    const { venues, additionalStatsItems } = useVenuesStats(publications);
    const router = useRouter();

    return (
        <>
            <ItemsStats
                className='mb-6'
                totalCount={venues.filter((v) => v.venueId).length}
                additionalItems={additionalStatsItems} />

            <StatsScaffold
                className={cn(
                    className,
                    'max-h-[min(80vh,40rem)]',
                    selectedPublTypesStatsVisual !== 'Table' ? 'h-[100vh] min-h-[30rem]' : '')}
                items={[
                    {
                        key: 'Bars',
                        content: (
                            <PublicationVenuesBarChart
                                publications={publications}
                                scaffoldId={scaffoldId}
                                selectedUnit={barChartSelectedUnit}
                                maxBarsCount={maxBarsCount}
                                onBarClick={publicationsUrl ?
                                    (key, value) => router.push(createFilteredPublicationsUrlByVenueId(publicationsUrl, key)) :
                                    undefined} />),
                        secondaryContent: (
                            <div
                                className='flex justify-between'>
                                <ChartUnitSelection
                                    className='p-3'
                                    selectedUnit={barChartSelectedUnit}
                                    setSelectedUnit={setBarChartSelectedUnit}
                                    unitsId={scaffoldId || ''} />
                                <CountInput
                                    label={'Venues count:'}
                                    scaffoldId={scaffoldId || ''}
                                    count={maxBarsCount}
                                    setCount={setMaxBarsCount} />
                            </div>),
                        title: 'Bar chart',
                        icon: (<MdBarChart />),

                    },
                    {
                        key: 'Table',
                        content: (<PublicationVenuesTable publications={publications} venues={venues} />),
                        title: 'Table',
                        icon: (<MdTableChart />),

                    },
                ]}
                scaffoldId={scaffoldId || 'publication-types-stats'}
                sideTabsLegend='Choose data visualisation'
                selectedKey={selectedPublTypesStatsVisual}
                onKeySelected={setSelectedPublTypesStatsVisual} />
        </>
    )
}

function PublicationVenuesBarChart({ publications, selectedUnit, maxBarsCount, onBarClick }: PublicationVenuesBarChartParams) {
    return (
        <BarChart
            orientation='Horizontal'
            selectedUnit={selectedUnit}
            bandThickness={45}
            secondaryAxisThickness={60}
            maxBarsCount={maxBarsCount}
            className='w-full h-full pl-2 xs:pl-4 pr-4 xs:pr-8 pt-7'
            onBarClick={onBarClick}
            data={{
                examinedProperty: (item) => item.venueId,
                barTitle: (key, value) => value?.items[0]?.venueTitle || key,
                barLink: (key, value) => key ? createVenueLinkFromId(key) : undefined,
                color: (key, value) => {
                    const type = key ? getVenueTypeFromDblpString(key) : null;

                    if (type) {
                        return `var(--${VENUE_TYPE_COLOR[type]})`;
                    }
                    return 'var(--primary)';
                },
                sortKeys: (pair1, pair2) => isSmaller(pair1.value?.value, pair2.value?.value),
                popoverContent: (key, value) => {
                    if (!value) {
                        return undefined;
                    }

                    const publications = value.items as Array<VenuePublication>;
                    const rolled = d3.rollup(publications, (items) => items.length, (item) => item.type);

                    return (
                        <PublicationTypesPopoverContent
                            publicationTypes={rolled} />
                    )
                },
                items: publications
            } as BarChartData<VenuePublication>} />
    )
}

function PublicationVenuesTable({ publications, venues }: PublicationVenuesTableParams) {
    return (
        <CountPercentageTable
            examinedValueTitle='Venue'
            examinedValueSortTitle='Sort by venue'
            examinedValues={venues}
            items={publications}
            toPresentedContent={tableToPresentedContent}
            toHref={tableToHref}
            filter={tableFilter}
            sortExaminedValue={sortByPresentedContent}
            rowKey={venueTableRowKey}
            hideFooter />
    )
}

function useVenuesStats(publications: VenuePublication[]) {
    const venues = useMemo(() => {
        const map = new Map<string | null, VenuePair>();

        for (const publication of publications) {
            if (!map.has(publication.venueId)) {
                map.set(publication.venueId, { venueId: publication.venueId, title: publication.venueTitle });
            }

            if (publication.seriesId && publication.seriesTitle && !map.has(publication.seriesId)) {
                map.set(publication.seriesId, { venueId: publication.seriesId, title: publication.seriesTitle });
            }
        }

        return [...map.values()];
    }, [publications])
    const additionalStatsItems = useMemo(() => {
        const items: Array<{ term: string; definition: string }> = [];
        const journalsCount = venues.filter((v) => v.venueId && getVenueTypeFromDblpString(v.venueId) === VenueType.Journal).length;
        const conferencesCount = venues.filter((v) => v.venueId && getVenueTypeFromDblpString(v.venueId) === VenueType.Conference).length;

        if (journalsCount) {
            items.push({ term: 'Journals count:', definition: journalsCount.toLocaleString(undefined, { useGrouping: true }) });
        }
        if (conferencesCount) {
            items.push({ term: 'Conferences count:', definition: conferencesCount.toLocaleString(undefined, { useGrouping: true }) });
        }

        return items;
    }, [venues])

    return { venues, additionalStatsItems };
}

function tableToPresentedContent(venue: VenuePair) {
    return venue.title;
}

function tableToHref(venue: VenuePair) {
    return venue.venueId ? createVenueLinkFromId(venue.venueId) : undefined;
}

function tableFilter(p: VenuePublication, venue: VenuePair) {
    return p.venueId === venue.venueId;
}

function venueTableRowKey(venue: VenuePair) {
    return venue.venueId || 'undefined';
}

function createVenueLinkFromId(id: string) {
    return getVenueTypeFromDblpString(id) === VenueType.Book ? undefined : createLocalPath(id, SearchType.Venue);
}

function createFilteredPublicationsUrlByVenueId(publicationsUrl: string, venueId: string | undefined) {
    const params = toVenuesSearchParamsString(venueId);
    return publicationsUrl.includes('?') ? `${publicationsUrl}&${params}` : `${publicationsUrl}?${params}`;
}