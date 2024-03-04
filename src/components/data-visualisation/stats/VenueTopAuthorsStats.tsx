'use client'

import BarChart, { BarChartData } from '@/components/data-visualisation/BarChart'
import ChartUnitSelection from '@/components/data-visualisation/ChartUnitSelection'
import StatsScaffold from '@/components/data-visualisation/StatsScaffold'
import { TableData } from '@/components/data-visualisation/Table'
import { ChartUnit } from '@/enums/ChartUnit'
import { isGreater, isSmaller } from '@/utils/array'
import { cn } from '@/utils/tailwindUtils'
import { useState } from 'react'
import { MdBarChart, MdTableChart } from 'react-icons/md'
import CountPercentageTable from '@/components/data-visualisation/CountPercentageTable'
import useSelectedChartUnit from '@/hooks/data-visualisation/useSelectedChartUnit'
import MaxCountInput from '../MaxCountInput'
import { sortByPresentedContent } from '@/utils/table'
import { SEARCH_AUTHOR } from '@/constants/urls'

type VenueTopAuthor = {
    nameId: string,
    name: string,
    publicationsCount: number,
}

type VenueTopAuthorsStatsParams = {
    className?: string,
    authors: Array<VenueTopAuthor>,
    totalPublicationsCount?: number,
    scaffoldId?: string,
}

type VenueTopAuthorsBarChartParams = {
    selectedUnit: ChartUnit,
    maxBarsCount: number
} & VenueTopAuthorsStatsParams

type VenueTopAuthorsTableParams = {
} & VenueTopAuthorsStatsParams

/** Displays top venue authors statistics. */
export default function VenueTopAuthorsStats({ className, authors, scaffoldId, totalPublicationsCount }: VenueTopAuthorsStatsParams) {
    const [selectedStatsVisual, setSelectedStatsVisual] = useState('Bars');
    const [barChartSelectedUnit, setBarChartSelectedUnit] = useSelectedChartUnit();
    const [maxBarsCount, setMaxBarsCount] = useState(100);

    return (
        <>
            <StatsScaffold
                className={cn(
                    className,
                    'max-h-[min(80vh,40rem)]',
                    selectedStatsVisual !== 'Table' ? 'h-[100vh] min-h-[30rem]' : '')}
                items={[
                    {
                        key: 'Bars',
                        content: (
                            <VenueTopAuthorsBarChart
                                authors={authors}
                                scaffoldId={scaffoldId}
                                totalPublicationsCount={totalPublicationsCount}
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
                                <MaxCountInput
                                    label={'Authors count:'}
                                    scaffoldId={scaffoldId || ''}
                                    maxCount={maxBarsCount}
                                    setMaxCount={setMaxBarsCount} />
                            </div>),
                        title: 'Bar chart',
                        icon: (<MdBarChart />),

                    },
                    {
                        key: 'Table',
                        content: (<VenueTopAuthorsTable authors={authors} totalPublicationsCount={totalPublicationsCount} />),
                        title: 'Table',
                        icon: (<MdTableChart />),

                    },
                ]}
                scaffoldId={scaffoldId || 'publication-types-stats'}
                sideTabsLegend='Choose data visualisation'
                selectedKey={selectedStatsVisual}
                onKeySelected={setSelectedStatsVisual} />
        </>
    )
}

function VenueTopAuthorsBarChart({ authors, selectedUnit, maxBarsCount, totalPublicationsCount }: VenueTopAuthorsBarChartParams) {
    return (
        <BarChart
            orientation='Horizontal'
            selectedUnit={selectedUnit}
            bandThickness={45}
            secondaryAxisThickness={60}
            maxBarsCount={maxBarsCount}
            className='w-full h-full pl-2 xs:pl-4 pr-4 xs:pr-8 pt-7'
            data={{
                examinedProperty: (item) => item.nameId,
                barTitle: (key, value) => value?.items[0]?.name || key,
                barLink: (key, value) => `${SEARCH_AUTHOR}/${key}`,
                color: (key) => 'var(--primary)',
                sortKeys: (pair1, pair2) => isSmaller(pair1.value?.value, pair2.value?.value),
                value: (items) => items.reduce((acc, item) => acc + item.publicationsCount, 0),
                items: authors,
                totalItemsCount: totalPublicationsCount
            } as BarChartData<VenueTopAuthor>} />
    )
}

function VenueTopAuthorsTable({ authors, totalPublicationsCount }: VenueTopAuthorsTableParams) {
    return (
        <CountPercentageTable
            examinedValueTitle='Author'
            examinedValueSortTitle='Sort by author name'
            examinedValues={authors}
            items={authors}
            itemsCount={tableItemsCount}
            totalCount={totalPublicationsCount}
            toPresentedContent={tableToPresentedContent}
            filter={tableFilter}
            sortExaminedValue={sortByPresentedContent}
            rowKey={tableRowKey} />
    )
}

function tableToPresentedContent(author: VenueTopAuthor) {
    return author.name;
}

function tableRowKey(author: VenueTopAuthor) {
    return author.nameId;
}

function tableFilter(a: VenueTopAuthor, author: VenueTopAuthor) {
    return a.nameId === author.nameId;
}

function tableItemsCount(items: Array<any>) {
    return items.length > 0 ? items[0].publicationsCount : 0;
}