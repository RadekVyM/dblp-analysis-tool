'use client'

import StatsScaffold from '@/app/(components)/StatsScaffold'
import { PublicationType } from '@/shared/enums/PublicationType'
import { useState } from 'react'
import { MdBarChart, MdBubbleChart, MdCircle, MdIncompleteCircle, MdTableChart, MdViewComfy } from 'react-icons/md'

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
                    title: 'Bubbles',
                    icon: (<MdBubbleChart />),

                },
                {
                    key: 'Pie',
                    content: (<p className='min-h-[30rem]'>Pie</p>),
                    title: 'Pie',
                    icon: (<MdIncompleteCircle />),

                },
                {
                    key: 'Bars',
                    content: (<p className='min-h-[30rem]'>Bars</p>),
                    title: 'Bars',
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
    return (
        <div className='grid content-stretch'>
            <table className='border-collapse table-auto'>
                <thead className='border-b border-outline'>
                    <tr>
                        <th scope='col' className='text-start p-2 w-[20rem]'>Type</th>
                        <th scope='col' className='text-start p-2'>Count</th>
                        <th scope='col' className='text-start p-2'>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.values(PublicationType).map((type, index) => {
                        const count = publications.filter((publ) => publ.type == type).length;

                        return (
                            <tr className={index % 2 == 0 ? ' bg-surface-dim-container' : ''}>
                                <th scope='row' className='text-start p-2 text-sm border-r border-outline'>{PUBLICATION_TYPE_TITLE[type]}</th>
                                <td className='p-2'>{count}</td>
                                <td className='p-2'>{((count / publications.length) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

const PUBLICATION_TYPE_TITLE = {
    [PublicationType.BooksAndTheses]: 'Books and Theses',
    [PublicationType.ConferenceAndWorkshopPapers]: 'Conference and Workshop Papers',
    [PublicationType.DataAndArtifacts]: 'Data and Artifacts',
    [PublicationType.Editorship]: 'Editorship',
    [PublicationType.InformalAndOther]: 'Informal and Other',
    [PublicationType.JournalArticles]: 'Journal Articles',
    [PublicationType.PartsInBooksOrCollections]: 'Parts in Books or Collections',
    [PublicationType.ReferenceWorks]: 'Reference Works',
} as const