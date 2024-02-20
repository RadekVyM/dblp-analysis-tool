'use client'

import BarChart, { BarChartData } from '@/components/data-visualisation/BarChart'
import ChartUnitSelection from '@/components/data-visualisation/ChartUnitSlection'
import StatsScaffold from '@/components/data-visualisation/StatsScaffold'
import { ChartUnit } from '@/enums/ChartUnit'
import { PublicationType } from '@/enums/PublicationType'
import { isGreater } from '@/utils/array'
import { cn } from '@/utils/tailwindUtils'
import { useState, useMemo } from 'react'
import { MdBarChart, MdSsidChart, MdTableChart } from 'react-icons/md'
import * as d3 from 'd3'
import LineChart from '@/components/data-visualisation/LineChart'
import CountPercentageTable from '@/components/data-visualisation/CountPercentageTable'
import useSelectedChartUnit from '@/hooks/data-visualisation/useSelectedChartUnit'

type OverTimePublication = {
    id: string,
    type: PublicationType,
    year: number,
}

type PublicationsOverTimeStatsParams = {
    className?: string,
    publications: Array<OverTimePublication>,
    scaffoldId?: string,
}

type PublicationsOverTimeBarChartParams = {
    selectedUnit: ChartUnit,
} & PublicationsOverTimeStatsParams

type PublicationsOverTimeLineChartParams = {
} & PublicationsOverTimeStatsParams

/** Displays publications statistics over time. */
export default function PublicationsOverTimeStats({ className, publications, scaffoldId }: PublicationsOverTimeStatsParams) {
    const [selectedPublTypesStatsVisual, setSelectedPublTypesStatsVisual] = useState('Bars');
    const [barChartSelectedUnit, setBarChartSelectedUnit] = useSelectedChartUnit();

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
                        <PublicationsOverTimeBarChart
                            publications={publications}
                            scaffoldId={scaffoldId}
                            selectedUnit={barChartSelectedUnit} />),
                    secondaryContent: (
                        <ChartUnitSelection
                            className='p-3'
                            selectedUnit={barChartSelectedUnit}
                            setSelectedUnit={setBarChartSelectedUnit}
                            unitsId={scaffoldId || ''} />),
                    title: 'Bar chart',
                    icon: (<MdBarChart />),
                },
                {
                    key: 'Line',
                    content: (
                        <PublicationsOverTimeLineChart
                            publications={publications}
                            scaffoldId={scaffoldId} />),
                    title: 'Line chart',
                    icon: (<MdSsidChart />),
                    isHidden: publications.every((publ) => publ.year === publications[0]?.year)
                },
                {
                    key: 'Table',
                    content: (<PublicationsOverTimeTable publications={publications} />),
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

function PublicationsOverTimeBarChart({ publications, selectedUnit }: PublicationsOverTimeBarChartParams) {
    return (
        <BarChart
            orientation='Vertical'
            selectedUnit={selectedUnit}
            bandThickness={45}
            secondaryAxisThickness={60}
            className='w-full h-full pr-4 xs:pr-8 pt-7'
            data={{
                examinedProperty: (item) => item.year,
                barTitle: (key) => key,
                color: (key) => 'primary',
                sortKeys: (pair1, pair2) => isGreater(pair1.key, pair2.key),
                fillMissingNumberKeys: true,
                items: publications
            } as BarChartData<OverTimePublication>} />
    )
}

function PublicationsOverTimeLineChart({ publications }: PublicationsOverTimeLineChartParams) {
    return (
        <LineChart
            secondaryAxisThickness={60}
            className='w-full h-full pr-4 xs:pr-8 pt-7'
            data={{
                examinedProperty: (item) => item.year,
                barTitle: (key) => key,
                color: (key) => 'primary',
                sortKeys: (pair1, pair2) => isGreater(pair1.key, pair2.key),
                fillMissingNumberKeys: true,
                items: publications
            } as BarChartData<OverTimePublication>} />
    )
}

function PublicationsOverTimeTable({ publications }: PublicationsOverTimeStatsParams) {
    const years = useMemo(() => {
        const [min, max] = d3.extent(publications.map((p) => p.year)) as [number, number];
        return d3.range(min, max + 1);
    }, [publications]);

    return (
        <CountPercentageTable
            examinatedValueTitle='Year'
            examinatedValueSortTitle='Sort by year'
            examinatedValues={years}
            items={publications}
            toPresentedContent={(year: number) => year.toString()}
            filter={(p: OverTimePublication, year: number) => p.year === year} />
    )
}