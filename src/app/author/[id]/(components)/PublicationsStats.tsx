'use client'

import StatsScaffold from '@/app/(components)/StatsScaffold'
import Table, { TableData } from '@/app/(components)/Table'
import { PUBLICATION_TYPE_TITLE } from '@/app/(constants)/publications'
import { PublicationType } from '@/shared/enums/PublicationType'
import { useState, useEffect } from 'react'
import { MdBarChart, MdBubbleChart, MdIncompleteCircle, MdTableChart, MdViewComfy } from 'react-icons/md'

type PublicationTypesStatsParams = {
    className?: string,
    publications: Array<{
        id: string,
        type: PublicationType,
        date: Date,
    }>
}

export function PublicationTypesStats({ className, publications }: PublicationTypesStatsParams) {
    const [selectedPublTypesStatsVisual, setSelectedPublTypesStatsVisual] = useState('Bubbles');

    return (
        <StatsScaffold
            className={className}
            items={[
                {
                    key: 'Bubbles',
                    content: (<p className='min-h-[30rem]'>Bubbles</p>),
                    title: 'Bubble chart',
                    icon: (<MdBubbleChart />),

                },
                {
                    key: 'Pie',
                    content: (<p className='min-h-[30rem]'>Pie</p>),
                    title: 'Pie chart',
                    icon: (<MdIncompleteCircle />),

                },
                {
                    key: 'Bars',
                    content: (<p className='min-h-[30rem]'>Bars</p>),
                    title: 'Bar chart',
                    icon: (<MdBarChart />),

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