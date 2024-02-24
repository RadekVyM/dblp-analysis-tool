'use client'

import BarChart, { BarChartData } from '@/components/data-visualisation/BarChart'
import ChartUnitSelection from '@/components/data-visualisation/ChartUnitSelection'
import PieChart, { PieChartData } from '@/components/data-visualisation/PieChart'
import StatsScaffold from '@/components/data-visualisation/StatsScaffold'
import { PUBLICATION_TYPE_COLOR, PUBLICATION_TYPE_TITLE } from '@/constants/client/publications'
import { ChartUnit } from '@/enums/ChartUnit'
import { PublicationType } from '@/enums/PublicationType'
import { cn } from '@/utils/tailwindUtils'
import { useState, useMemo } from 'react'
import { MdBarChart, MdIncompleteCircle, MdTableChart } from 'react-icons/md'
import CountPercentageTable from '@/components/data-visualisation/CountPercentageTable'
import useSelectedChartUnit from '@/hooks/data-visualisation/useSelectedChartUnit'
import { sortByPresentedContent } from '@/utils/table'

type TypePublication = {
    id: string,
    type: PublicationType,
    date: Date,
}

type PublicationTypesStatsParams = {
    className?: string,
    publications: Array<TypePublication>,
    scaffoldId?: string,
}

type PublicationTypesBarChartParams = {
    selectedUnit: ChartUnit,
} & PublicationTypesStatsParams

/** Displays publications statistics by type of a publication. */
export default function PublicationTypesStats({ className, publications, scaffoldId }: PublicationTypesStatsParams) {
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
            sideTabsLegend='Choose data visualisation'
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
            className='w-full h-full pl-2 xs:pl-4 px-4 xs:px-8 pt-7'
            data={{
                examinedProperty: (item) => item.type,
                barTitle: (key) => PUBLICATION_TYPE_TITLE[key as PublicationType],
                color: (key) => PUBLICATION_TYPE_COLOR[key as PublicationType],
                items: publications
            } as BarChartData<TypePublication>} />
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
            examinedValueTitle='Type'
            examinedValueSortTitle='Sort by publication type'
            examinedValues={types}
            items={publications}
            toPresentedContent={(type: PublicationType) => PUBLICATION_TYPE_TITLE[type]}
            filter={(p: TypePublication, type: PublicationType) => p.type === type}
            sortExaminedValue={sortByPresentedContent} />
    )
}