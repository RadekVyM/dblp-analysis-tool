'use client'

import BarChart, { BarChartData } from '@/components/data-visualisation/BarChart'
import ChartUnitSelection from '@/components/data-visualisation/ChartUnitSelection'
import StatsScaffold from '@/components/data-visualisation/StatsScaffold'
import { ChartUnit } from '@/enums/ChartUnit'
import { PublicationType } from '@/enums/PublicationType'
import { isGreater } from '@/utils/array'
import { cn } from '@/utils/tailwindUtils'
import { useState, useMemo, useEffect } from 'react'
import { MdBarChart, MdSsidChart, MdTableChart } from 'react-icons/md'
import * as d3 from 'd3'
import LineChart from '@/components/data-visualisation/LineChart'
import CountPercentageTable from '@/components/data-visualisation/CountPercentageTable'
import useSelectedChartUnit from '@/hooks/data-visualisation/useSelectedChartUnit'
import { ChartValue } from '@/dtos/data-visualisation/ChartValue'
import { useRouter } from 'next/navigation'

/** These items will be grouped by a chart or table. */
type OverTimePublication = {
    id: string,
    type: PublicationType,
    year: number,
}

/** These items are already grouped. */
type SimplifiedOverTimePublication = {
    year: number,
    count: number
}

type PublicationsOverTimeStatsParams = {
    className?: string,
    publications: Array<OverTimePublication | SimplifiedOverTimePublication>,
    /** This property needs to be set to true when simplified publications are used */
    isSimplified?: boolean,
    scaffoldId?: string,
    publicationsUrl?: string,
}

type PublicationsOverTimeBarChartParams = {
    selectedUnit: ChartUnit,
    onBarClick?: (key: any, value?: ChartValue) => void,
} & PublicationsOverTimeStatsParams

type PublicationsOverTimeLineChartParams = {
} & PublicationsOverTimeStatsParams

/** Displays publications statistics over time. */
export default function PublicationsOverTimeStats({ className, publications, scaffoldId, isSimplified, publicationsUrl }: PublicationsOverTimeStatsParams) {
    const isLineChartHidden = publications.every((publ) => publ.year === publications[0]?.year);
    const [selectedPublTypesStatsVisual, setSelectedPublTypesStatsVisual] = useState(isLineChartHidden ? 'Bars' : 'Line');
    const [barChartSelectedUnit, setBarChartSelectedUnit] = useSelectedChartUnit();
    const router = useRouter();
    const items = useMemo(() => [
        {
            key: 'Line',
            content: (
                <PublicationsOverTimeLineChart
                    publications={publications}
                    scaffoldId={scaffoldId}
                    isSimplified={isSimplified} />),
            title: 'Line chart',
            icon: (<MdSsidChart />),
            isHidden: isLineChartHidden
        },
        {
            key: 'Bars',
            content: (
                <PublicationsOverTimeBarChart
                    publications={publications}
                    scaffoldId={scaffoldId}
                    isSimplified={isSimplified}
                    selectedUnit={barChartSelectedUnit}
                    onBarClick={publicationsUrl ?
                        (key, value) => router.push(createFilteredPublicationsUrlByYear(publicationsUrl, key.toString())) :
                        undefined} />),
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
            key: 'Table',
            content: (
                <PublicationsOverTimeTable
                    publications={publications}
                    isSimplified={isSimplified} />),
            title: 'Table',
            icon: (<MdTableChart />),

        },
    ], [publications, scaffoldId, barChartSelectedUnit, isLineChartHidden]);

    useEffect(() => {
        if (isLineChartHidden && selectedPublTypesStatsVisual === 'Line') {
            setSelectedPublTypesStatsVisual('Bars');
        }
    }, [isLineChartHidden, selectedPublTypesStatsVisual]);

    return (
        <StatsScaffold
            className={cn(
                className,
                'max-h-[min(80vh,40rem)]',
                selectedPublTypesStatsVisual !== 'Table' ? 'h-[100vh] min-h-[30rem]' : '')}
            items={items}
            scaffoldId={scaffoldId || 'publications-over-time-stats'}
            sideTabsLegend='Choose data visualisation'
            selectedKey={selectedPublTypesStatsVisual}
            onKeySelected={setSelectedPublTypesStatsVisual} />
    )
}

function PublicationsOverTimeBarChart({ publications, selectedUnit, isSimplified, onBarClick }: PublicationsOverTimeBarChartParams) {
    return (
        <BarChart
            orientation='Vertical'
            selectedUnit={selectedUnit}
            bandThickness={45}
            secondaryAxisThickness={60}
            className='w-full h-full pr-4 xs:pr-8 pt-7'
            onBarClick={onBarClick}
            data={{
                examinedProperty: (item) => item.year,
                barTitle: (key) => key,
                color: (key) => 'primary',
                sortKeys: (pair1, pair2) => isGreater(pair1.key, pair2.key),
                value: isSimplified ? (items) => chartValueOfSimplifiedPublications(items as Array<SimplifiedOverTimePublication>) : undefined,
                fillMissingNumberKeys: true,
                items: publications
            } as BarChartData<OverTimePublication | SimplifiedOverTimePublication>} />
    )
}

function PublicationsOverTimeLineChart({ publications, isSimplified }: PublicationsOverTimeLineChartParams) {
    return (
        <LineChart
            secondaryAxisThickness={60}
            className='w-full h-full pr-4 xs:pr-8 pt-7'
            data={{
                examinedProperty: (item) => item.year,
                barTitle: (key) => key,
                color: (key) => 'primary',
                sortKeys: (pair1, pair2) => isGreater(pair1.key, pair2.key),
                value: isSimplified ? (items) => chartValueOfSimplifiedPublications(items as Array<SimplifiedOverTimePublication>) : undefined,
                fillMissingNumberKeys: true,
                items: publications
            } as BarChartData<OverTimePublication | SimplifiedOverTimePublication>} />
    )
}

function PublicationsOverTimeTable({ publications, isSimplified }: PublicationsOverTimeStatsParams) {
    const years = useMemo(() => {
        const [min, max] = d3.extent(publications.map((p) => p.year)) as [number, number];
        return d3.range(min, max + 1);
    }, [publications]);

    return (
        <CountPercentageTable
            examinedValueTitle='Year'
            examinedValueSortTitle='Sort by year'
            examinedValues={years}
            items={publications}
            totalCount={isSimplified ? publications.reduce((acc, item) => acc + (item as SimplifiedOverTimePublication).count, 0) : undefined}
            itemsCount={isSimplified ? (items) => (items.length > 0 ? items[0].count : 0) : undefined}
            toPresentedContent={(year: number) => year.toString()}
            filter={(p: OverTimePublication | SimplifiedOverTimePublication, year: number) => p.year === year} />
    )
}

function chartValueOfSimplifiedPublications(items: Array<SimplifiedOverTimePublication>) {
    return items.reduce((acc, item) => acc + item.count, 0);
}

function createFilteredPublicationsUrlByYear(publicationsUrl: string, year: string) {
    const params = `year=${year}`;
    return publicationsUrl.includes('?') ? `${publicationsUrl}&${params}` : `${publicationsUrl}?${params}`;
}