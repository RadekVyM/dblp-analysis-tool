'use client'

import BarChart, { BarChartData } from '@/components/data-visualisation/BarChart'
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
import { VENUE_TYPE_COLOR } from '@/constants/client/publications'
import ItemsStats from '@/components/ItemsStats'
import MaxCountInput from '../MaxCountInput'
import { sortByPresentedContent } from '@/utils/table'
import { ChartValue } from '@/dtos/data-visualisation/ChartValue'
import { useRouter } from 'next/navigation'
import { toVenuesSearchParamsString } from '@/utils/publicationsSearchParams'
import { SearchType } from '@/enums/SearchType'
import { VenueType } from '@/enums/VenueType'

type VenuePublication = {
    id: string,
    type: PublicationType,
    venueId: string | null,
    venueTitle: string,
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
    const venues = useMemo(() => {
        const map = new Map<string | null, VenuePair>();

        for (const publication of publications) {
            if (!map.has(publication.venueId)) {
                map.set(publication.venueId, { venueId: publication.venueId, title: publication.venueTitle });
            }
        }

        return [...map.values()]
    }, [publications]);
    const router = useRouter();

    return (
        <>
            <ItemsStats
                className='mb-6'
                totalCount={venues.length} />

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
                                <MaxCountInput
                                    label={'Venues count:'}
                                    scaffoldId={scaffoldId || ''}
                                    maxCount={maxBarsCount}
                                    setMaxCount={setMaxBarsCount} />
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
                barTitle: (key, value) => getVenueTypeFromDblpString(key) === VenueType.Book ? 'Books' : value?.items[0]?.venueTitle || key,
                barLink: (key, value) => getVenueTypeFromDblpString(key) === VenueType.Book ? undefined : createLocalPath(key, SearchType.Venue),
                color: (key, value) => {
                    const type = key ? getVenueTypeFromDblpString(key) : null;

                    if (type) {
                        return VENUE_TYPE_COLOR[type];
                    }
                    return 'primary';
                },
                sortKeys: (pair1, pair2) => isSmaller(pair1.value?.value, pair2.value?.value),
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
            toPresentedContent={(venue: VenuePair) => venue.title}
            filter={(p: VenuePublication, venue: VenuePair) => p.venueId === venue.venueId}
            sortExaminedValue={sortByPresentedContent}
            rowKey={venueTableRowKey} />
    )
}

function venueTableRowKey(venue: VenuePair) {
    return venue.venueId || 'undefined';
}

function createFilteredPublicationsUrlByVenueId(publicationsUrl: string, venueId: string | undefined) {
    const params = toVenuesSearchParamsString(venueId);
    return publicationsUrl.includes('?') ? `${publicationsUrl}&${params}` : `${publicationsUrl}?${params}`;
}