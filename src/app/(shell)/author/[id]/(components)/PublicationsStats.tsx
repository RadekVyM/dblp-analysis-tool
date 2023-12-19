'use client'

import HorizontalBarChart, { HorizontalBarChartData } from '@/components/data-visualisation/HorizontalBarChart'
import PieChart, { PieChartData } from '@/components/data-visualisation/PieChart'
import { DataVisualisationSvg } from '@/components/data-visualisation/DataVisualisationSvg'
import StatsScaffold from '@/components/data-visualisation/StatsScaffold'
import Table from '@/components/data-visualisation/Table'
import { PUBLICATION_TYPE_COLOR, PUBLICATION_TYPE_TITLE } from '@/constants/client/publications'
import { PublicationType } from '@/enums/PublicationType'
import { useState, useMemo } from 'react'
import { MdBarChart, MdIncompleteCircle, MdTableChart } from 'react-icons/md'

type Publ = {
    id: string,
    type: PublicationType,
    date: Date,
}

type PublicationTypesStatsParams = {
    className?: string,
    publications: Array<Publ>,
    scaffoldId?: string,
}

export function PublicationTypesStats({ className, publications, scaffoldId }: PublicationTypesStatsParams) {
    const [selectedPublTypesStatsVisual, setSelectedPublTypesStatsVisual] = useState('Bars');

    return (
        <StatsScaffold
            className={className}
            items={[
                {
                    key: 'Bars',
                    content: (<PublicationTypesStatsBarChart publications={publications} scaffoldId={scaffoldId} />),
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
                    content: (<PublicationTypesStatsTable publications={publications} />),
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

function PublicationTypesStatsBarChart({ publications, scaffoldId }: PublicationTypesStatsParams) {
    return (
        <HorizontalBarChart
            unitsId={scaffoldId || ''}
            className='w-full h-[100vh] min-h-[30rem] max-h-[min(80vh,40rem)] px-4 xs:px-8 py-7'
            innerClassName='min-w-[20rem]'
            data={{
                bar: (value) => value.type,
                barTitle: (key) => PUBLICATION_TYPE_TITLE[key as PublicationType],
                color: (key) => PUBLICATION_TYPE_COLOR[key as PublicationType],
                items: publications
            } as HorizontalBarChartData<Publ>} />
    )
}

function PublicationTypesStatsPieChart({ publications }: PublicationTypesStatsParams) {
    return (
        <PieChart
            className='w-full h-[100vh] min-h-[30rem] max-h-[min(80vh,40rem)] px-5 xs:px-10 py-7'
            arcClassName='stroke-surface-container stroke-[0.1rem]'
            data={{
                piece: (value) => value.type,
                pieceTitle: (key) => PUBLICATION_TYPE_TITLE[key as PublicationType],
                color: (key) => PUBLICATION_TYPE_COLOR[key as PublicationType],
                items: publications
            } as PieChartData<Publ>} />
    )
}

function PublicationTypesStatsTable({ publications }: PublicationTypesStatsParams) {
    const rows = useMemo(() =>
        Object.values(PublicationType).map((type, index) => {
            const count = publications.filter((publ) => publ.type == type).length;
            const percentage = count / publications.length;

            return [
                { value: PUBLICATION_TYPE_TITLE[type], presentedContent: PUBLICATION_TYPE_TITLE[type] },
                { value: count, presentedContent: count },
                { value: percentage, presentedContent: percentage.toLocaleString(undefined, { maximumFractionDigits: 2, style: 'percent' }) }
            ]
        }),
        [publications]);
    const footer = [
        { value: 'Totals', presentedContent: 'Totals' },
        { value: publications.length, presentedContent: publications.length },
        { value: 1, presentedContent: (1).toLocaleString(undefined, { maximumFractionDigits: 2, style: 'percent' }) }
    ]

    return (
        <Table
            rows={rows}
            columnHeaders={[
                {
                    column: 0,
                    sortingTitle: 'Sort by publication type',
                    title: 'Type',
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