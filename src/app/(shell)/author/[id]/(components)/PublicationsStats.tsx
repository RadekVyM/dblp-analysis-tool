'use client'

import BarChart, { BarChartData } from '@/components/data-visualisation/BarChart'
import ChartUnitSelection from '@/components/data-visualisation/ChartUnitSlection'
import PieChart, { PieChartData } from '@/components/data-visualisation/PieChart'
import StatsScaffold from '@/components/data-visualisation/StatsScaffold'
import Table from '@/components/data-visualisation/Table'
import { PUBLICATION_TYPE_COLOR, PUBLICATION_TYPE_TITLE } from '@/constants/client/publications'
import { ChartUnit } from '@/enums/ChartUnit'
import { PublicationType } from '@/enums/PublicationType'
import { isGreater } from '@/utils/array'
import { cn } from '@/utils/tailwindUtils'
import { useState, useMemo } from 'react'
import { MdBarChart, MdIncompleteCircle, MdTableChart } from 'react-icons/md'
import * as d3 from 'd3'

type TypePublication = {
    id: string,
    type: PublicationType,
    date: Date,
}

type OverTimePublication = {
    id: string,
    type: PublicationType,
    year: number,
}

type PublicationTypesStatsParams = {
    className?: string,
    publications: Array<TypePublication>,
    scaffoldId?: string,
}

type PublicationsOverTimeStatsParams = {
    className?: string,
    publications: Array<OverTimePublication>,
    scaffoldId?: string,
}

type PublicationTypesBarChartParams = {
    selectedUnit: ChartUnit,
} & PublicationTypesStatsParams

type PublicationsOverTimeBarChartParams = {
    selectedUnit: ChartUnit,
} & PublicationsOverTimeStatsParams

type CountPercentageTableParams = {
    filter: (item: any, examinatedValue: any) => boolean,
    items: Array<any>,
    examinatedValues: Array<any>,
}

/** Displays publications statistics. */
export function PublicationTypesStats({ className, publications, scaffoldId }: PublicationTypesStatsParams) {
    const [selectedPublTypesStatsVisual, setSelectedPublTypesStatsVisual] = useState('Bars');
    const [barChartSelectedUnit, setBarChartSelectedUnit] = useSelectedChartUnit();

    return (
        <StatsScaffold
            className={cn(
                className,
                selectedPublTypesStatsVisual !== 'Table' ? 'h-[100vh] min-h-[30rem] max-h-[min(80vh,40rem)]' : '')}
            items={[
                {
                    key: 'Bars',
                    content: (
                        <PublicationTypesStatsBarChart
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
                    key: 'Pie',
                    content: (<PublicationTypesStatsPieChart publications={publications} />),
                    title: 'Pie chart',
                    icon: (<MdIncompleteCircle />),

                },
                {
                    key: 'Table',
                    content: (<PublicationTypesTable publications={publications} />),
                    title: 'Table',
                    icon: (<MdTableChart />),

                },
            ]}
            scaffoldId={scaffoldId || 'publication-types-stats'}
            sideTabsLegend='Choose data visualization'
            selectedKey={selectedPublTypesStatsVisual}
            onKeySelected={setSelectedPublTypesStatsVisual} />
    )
}

export function PublicationsOverTimeStats({ className, publications, scaffoldId }: PublicationsOverTimeStatsParams) {
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
                    key: 'Table',
                    content: (<PublicationsOverTimeTable publications={publications} />),
                    title: 'Table',
                    icon: (<MdTableChart />),

                },
            ]}
            scaffoldId={scaffoldId || 'publication-types-stats'}
            sideTabsLegend='Choose data visualization'
            selectedKey={selectedPublTypesStatsVisual}
            onKeySelected={setSelectedPublTypesStatsVisual} />
    )
}

function PublicationTypesStatsBarChart({ publications, selectedUnit }: PublicationTypesBarChartParams) {
    return (
        <BarChart
            orientation='Horizontal'
            selectedUnit={selectedUnit}
            bandThickness={60}
            className='w-full h-full px-4 xs:px-8 pt-7'
            data={{
                examinedProperty: (item) => item.type,
                barTitle: (key) => PUBLICATION_TYPE_TITLE[key as PublicationType],
                color: (key) => PUBLICATION_TYPE_COLOR[key as PublicationType],
                items: publications
            } as BarChartData<TypePublication>} />
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
                sortKeys: isGreater,
                fillMissingNumberKeys: true,
                items: publications
            } as BarChartData<OverTimePublication>} />
    )
}

function PublicationTypesStatsPieChart({ publications }: PublicationTypesStatsParams) {
    return (
        <PieChart
            className='w-full h-full px-5 xs:px-10 py-7'
            arcClassName='stroke-surface-container stroke-[0.1rem]'
            data={{
                slice: (item) => item.type,
                sliceTitle: (key) => PUBLICATION_TYPE_TITLE[key as PublicationType],
                color: (key) => PUBLICATION_TYPE_COLOR[key as PublicationType],
                items: publications
            } as PieChartData<TypePublication>} />
    )
}

function PublicationTypesTable({ publications }: PublicationTypesStatsParams) {
    const types = useMemo(() => Object.values(PublicationType), []);

    return (
        <CountPercentageTable
            examinatedValues={types}
            items={publications}
            filter={(p: TypePublication, type: PublicationType) => p.type === type} />
    )
}

function PublicationsOverTimeTable({ publications }: PublicationsOverTimeStatsParams) {
    const years = useMemo(() => {
        const [min, max] = d3.extent(publications.map((p) => p.year)) as [number, number];
        return d3.range(min, max + 1);
    }, [publications]);

    return (
        <CountPercentageTable
            examinatedValues={years}
            items={publications}
            filter={(p: OverTimePublication, year: number) => p.year === year} />
    )
}

function CountPercentageTable({ items, examinatedValues, filter }: CountPercentageTableParams) {
    const rows = useMemo(() =>
        examinatedValues.map((examinatedValue, index) => {
            const count = items.filter((item) => filter(item, examinatedValue)).length;
            const percentage = count / items.length;

            return [
                { value: examinatedValue, presentedContent: examinatedValue.toString() },
                { value: count, presentedContent: count },
                { value: percentage, presentedContent: percentage.toLocaleString(undefined, { maximumFractionDigits: 2, style: 'percent' }) }
            ]
        }),
        [examinatedValues]);
    const footer = [
        { value: 'Totals', presentedContent: 'Totals' },
        { value: items.length, presentedContent: items.length },
        { value: 1, presentedContent: (1).toLocaleString(undefined, { maximumFractionDigits: 2, style: 'percent' }) }
    ];

    return (
        <Table
            className='h-full'
            rows={rows}
            columnHeaders={[
                {
                    column: 0,
                    sortingTitle: 'Sort by year',
                    title: 'Year',
                    className: 'w-[20rem]'
                },
                {
                    column: 1,
                    sortingTitle: 'Sort by count',
                    title: 'Count'
                },
                {
                    column: 2,
                    sortingTitle: 'Sort by percentage',
                    title: 'Percentage'
                }
            ]}
            footer={footer}
            isFirstColumnHeader />
    )
}

function useSelectedChartUnit() {
    return useState<ChartUnit>(ChartUnit.Count);
}