'use client'

import BarChart, { BarChartData } from '@/components/data-visualisation/BarChart'
import ChartUnitSelection from '@/components/data-visualisation/ChartUnitSlection'
import StatsScaffold from '@/components/data-visualisation/StatsScaffold'
import { TableData } from '@/components/data-visualisation/Table'
import { ChartUnit } from '@/enums/ChartUnit'
import { PublicationType } from '@/enums/PublicationType'
import { isGreater, isSmaller } from '@/utils/array'
import { cn } from '@/utils/tailwindUtils'
import { useState, useMemo } from 'react'
import { MdBarChart, MdTableChart } from 'react-icons/md'
import CountPercentageTable from '@/components/data-visualisation/CountPercentageTable'
import useSelectedChartUnit from '@/hooks/data-visualisation/useSelectedChartUnit'
import { getVenueTypeFromDblpString } from '@/utils/urls'
import { VENUE_TYPE_COLOR } from '@/constants/client/publications'

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
}

type PublicationVenuesBarChartParams = {
    selectedUnit: ChartUnit,
    maxBarsCount: number
} & PublicationVenuesStatsParams

type MaxVenuesCountInputParams = {
    scaffoldId: string,
    maxVenuesCount: number,
    setMaxVenuesCount: (value: number) => void
}

type VenuePair = { venueId: string | null, title: string }

/** Displays publications statistics by venues. */
export default function PublicationVenuesStats({ className, publications, scaffoldId }: PublicationVenuesStatsParams) {
    const [selectedPublTypesStatsVisual, setSelectedPublTypesStatsVisual] = useState('Bars');
    const [barChartSelectedUnit, setBarChartSelectedUnit] = useSelectedChartUnit();
    const [maxBarsCount, setMaxBarsCount] = useState(100);

    return (
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
                            maxBarsCount={maxBarsCount} />),
                    secondaryContent: (
                        <div
                            className='flex justify-between'>
                            <ChartUnitSelection
                                className='p-3'
                                selectedUnit={barChartSelectedUnit}
                                setSelectedUnit={setBarChartSelectedUnit}
                                unitsId={scaffoldId || ''} />
                            <MaxVenuesCountInput
                                scaffoldId={scaffoldId || ''}
                                maxVenuesCount={maxBarsCount}
                                setMaxVenuesCount={setMaxBarsCount} />
                        </div>),
                    title: 'Bar chart',
                    icon: (<MdBarChart />),

                },
                {
                    key: 'Table',
                    content: (<PublicationVenuesTable publications={publications} />),
                    title: 'Table',
                    icon: (<MdTableChart />),

                },
            ]}
            scaffoldId={scaffoldId || 'publication-types-stats'}
            sideTabsLegend='Choose data visualisation'
            selectedKey={selectedPublTypesStatsVisual}
            onKeySelected={setSelectedPublTypesStatsVisual} />
    )
}

function PublicationVenuesBarChart({ publications, selectedUnit, maxBarsCount }: PublicationVenuesBarChartParams) {
    return (
        <BarChart
            orientation='Horizontal'
            selectedUnit={selectedUnit}
            bandThickness={45}
            secondaryAxisThickness={60}
            maxBarsCount={maxBarsCount}
            className='w-full h-full pl-2 xs:pl-4 pr-4 xs:pr-8 pt-7'
            data={{
                examinedProperty: (item) => item.venueId,
                barTitle: (key, value) => value?.items[0]?.venueTitle || key,
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

function PublicationVenuesTable({ publications }: PublicationVenuesStatsParams) {
    const venues = useMemo(() => {
        const map = new Map<string | null, VenuePair>();

        for (const publication of publications) {
            if (!map.has(publication.venueId)) {
                map.set(publication.venueId, { venueId: publication.venueId, title: publication.venueTitle });
            }
        }

        return [...map.values()]
    }, [publications]);

    return (
        <CountPercentageTable
            examinatedValueTitle='Venue'
            examinatedValueSortTitle='Sort by venue'
            examinatedValues={venues}
            items={publications}
            toPresentedContent={(venue: VenuePair) => venue.title}
            filter={(p: VenuePublication, venue: VenuePair) => p.venueId === venue.venueId}
            sortExaminedValue={sortByPresentedContent}
            rowKey={venueTableRowKey} />
    )
}

function MaxVenuesCountInput({ scaffoldId, maxVenuesCount, setMaxVenuesCount }: MaxVenuesCountInputParams) {
    return (
        <div
            className='self-center pr-3 inline text-right'>
            <label
                htmlFor={`${scaffoldId}-limit-input`}
                className='text-sm relative'>
                Venues Count:
            </label>
            <input
                id={`${scaffoldId}-limit-input`}
                className='pl-2 ml-3 min-w-0 w-24 h-7 border border-outline rounded-md text-sm'
                value={maxVenuesCount}
                step={1}
                onChange={(e) => setMaxVenuesCount(parseInt(e.currentTarget.value))}
                type='number' />
        </div>
    )
}

function sortByPresentedContent(first: TableData, second: TableData): number {
    return isGreater(first.presentedContent, second.presentedContent);
}

function venueTableRowKey(venue: VenuePair) {
    return venue.venueId || 'undefined';
}