'use client'

import HorizontalBarChart, { HorizontalBarChartData } from '@/app/(components)/(data-visualisation)/HorizontalBarChart'
import PieChart, { PieChartData } from '@/app/(components)/(data-visualisation)/PieChart'
import { VisualDataContainer, ZoomTransform } from '@/app/(components)/(data-visualisation)/VisualDataContainer'
import StatsScaffold from '@/app/(components)/StatsScaffold'
import Table, { TableData } from '@/app/(components)/Table'
import { PUBLICATION_TYPE_COLOR, PUBLICATION_TYPE_FILL, PUBLICATION_TYPE_TITLE } from '@/app/(constants)/publications'
import { PublicationType } from '@/shared/enums/PublicationType'
import { useState, useEffect, useRef } from 'react'
import { MdBarChart, MdBubbleChart, MdIncompleteCircle, MdTableChart, MdViewComfy } from 'react-icons/md'

type Publ = {
    id: string,
    type: PublicationType,
    date: Date,
}

type PublicationTypesStatsParams = {
    className?: string,
    publications: Array<Publ>
}

export function PublicationTypesStats({ className, publications }: PublicationTypesStatsParams) {
    const [selectedPublTypesStatsVisual, setSelectedPublTypesStatsVisual] = useState('Bars');

    return (
        <StatsScaffold
            className={className}
            items={[
                {
                    key: 'Bars',
                    content: (<PublicationTypesStatsBarChart publications={publications} />),
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
                    key: 'Bubbles',
                    content: (<PublicationTypesStatsBubblesChart />),
                    title: 'Bubble chart',
                    icon: (<MdBubbleChart />),

                },
                {
                    key: 'Treemap',
                    content: (<p className='min-h-[30rem]'>Treemap</p>),
                    title: 'Treemap',
                    icon: (<MdViewComfy />),

                },
                {
                    key: 'Table',
                    content: (<PublicationTypesStatsTable publications={publications} />),
                    title: 'Table',
                    icon: (<MdTableChart />),

                },
            ]}
            scaffoldId='publication-types-stats'
            sideTabsLegend='Choose data visualization'
            selectedKey={selectedPublTypesStatsVisual}
            onKeySelected={setSelectedPublTypesStatsVisual} />
    )
}

function PublicationTypesStatsBarChart({ publications }: PublicationTypesStatsParams) {
    return (
        <HorizontalBarChart
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

function PublicationTypesStatsBubblesChart() {
    const [zoomTransform, setZoomTransform] = useState<ZoomTransform>({ scale: 1, x: 0, y: 0 });

    return (
        <VisualDataContainer
            className='w-full h-[100vh] min-h-[30rem] max-h-[min(80vh,40rem)]'
            onZoomChange={(transform) => setZoomTransform(transform)}
            zoomScaleExtent={{ max: 8 }}>
            <g
                transform={`translate(${zoomTransform.x},${zoomTransform.y}) scale(${zoomTransform.scale})`}>
                <text x={0} y={20}>Hello Bubbles</text>
            </g>
        </VisualDataContainer>
    )
}

function PublicationTypesStatsTable({ publications }: PublicationTypesStatsParams) {
    const [rows, setRows] = useState<Array<Array<TableData>>>([]);

    useEffect(() => {
        const newRows = Object.values(PublicationType).map((type, index) => {
            const count = publications.filter((publ) => publ.type == type).length;
            const percentage = count / publications.length;

            return [
                { value: PUBLICATION_TYPE_TITLE[type], presentedContent: PUBLICATION_TYPE_TITLE[type] },
                { value: count, presentedContent: count },
                { value: percentage, presentedContent: percentage.toLocaleString(undefined, { maximumFractionDigits: 2, style: 'percent' }) }
            ]
        });

        setRows(newRows);
    }, [publications]);

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
            ]} />
    )
}