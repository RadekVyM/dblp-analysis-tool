'use client'

import BarChart, { BarChartData } from '@/components/data-visualisation/charts/BarChart'
import ChartUnitSelection from '@/components/data-visualisation/ChartUnitSelection'
import StatsScaffold from '@/components/data-visualisation/StatsScaffold'
import { ChartUnit } from '@/enums/ChartUnit'
import { PublicationType } from '@/enums/PublicationType'
import { isGreater } from '@/utils/array'
import { cn } from '@/utils/tailwindUtils'
import { useState, useMemo, useEffect } from 'react'
import { MdBarChart, MdSsidChart, MdTableChart } from 'react-icons/md'
import * as d3 from 'd3'
import LineChart, { LineChartData } from '@/components/data-visualisation/charts/LineChart'
import CountPercentageTable from '@/components/data-visualisation/CountPercentageTable'
import useSelectedChartUnit from '@/hooks/data-visualisation/useSelectedChartUnit'
import { ChartValue } from '@/dtos/data-visualisation/ChartValue'
import { useRouter } from 'next/navigation'
import { toYearsSearchParamsString } from '@/utils/publicationsSearchParams'
import { PUBLICATION_TYPE_COLOR } from '@/constants/publications'
import PublicationTypesPopoverContent from './PublicationTypesPopoverContent'
import DividedDefinitionList from '@/components/DividedDefinitionList'

/** These items will be grouped by a chart or table. */
type OverTimePublication = {
    id: string,
    year: number,
    type: PublicationType,
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
    displayTypesDistribution?: boolean,
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
                        (key, value) => value && value.items.length > 0 && router.push(createFilteredPublicationsUrlByYear(publicationsUrl, key)) :
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
        // setBarChartSelectedUnit should not trigger this memo function
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [publications, scaffoldId, isSimplified, publicationsUrl, barChartSelectedUnit, isLineChartHidden, router]);
    const statsItem = useMemo(() => {
        const [min, max] = d3.extent(publications, (item) => item.year);

        if (!min || !max) {
            return undefined;
        }

        const count = isSimplified ?
            publications.reduce((acc, current) => acc + (current as SimplifiedOverTimePublication).count, 0) :
            publications.length;
        const average = count / (Math.abs(max - min) + 1);

        return [
            { term: 'Publication years:', definition: min === max ? min.toString() : `${min}-${max}` },
            { term: 'Average per year:', definition: Math.round(average).toLocaleString(undefined, { useGrouping: true }) },
        ];
    }, [publications, isSimplified]);

    useEffect(() => {
        if (isLineChartHidden && selectedPublTypesStatsVisual === 'Line') {
            setSelectedPublTypesStatsVisual('Bars');
        }
    }, [isLineChartHidden, selectedPublTypesStatsVisual]);

    return (
        <>
            {statsItem &&
                <DividedDefinitionList
                    className='mb-6'
                    items={statsItem} />}

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
        </>
    )
}

function PublicationsOverTimeBarChart({ publications, selectedUnit, isSimplified, displayTypesDistribution, onBarClick }: PublicationsOverTimeBarChartParams) {
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
                gradient: displayTypesDistribution ? barGradient : undefined,
                color: (key, value) => {
                    if (displayTypesDistribution && !isSimplified && value) {
                        return `url(#${key})`;
                    }

                    return 'var(--primary)';
                },
                sortKeys: (pair1, pair2) => isGreater(pair1.key, pair2.key),
                value: isSimplified ? (items) => chartValueOfSimplifiedPublications(items as Array<SimplifiedOverTimePublication>) : undefined,
                popoverContent: (key, value) => {
                    if (!value || isSimplified) {
                        return undefined;
                    }

                    const publications = value.items as Array<OverTimePublication>;
                    const rolled = d3.rollup(publications, (items) => items.length, (item) => item.type);

                    return (
                        <PublicationTypesPopoverContent
                            publicationTypes={rolled} />
                    )
                },
                totalItemsCount: isSimplified ?
                    publications.reduce((acc, item) => acc + (item as SimplifiedOverTimePublication).count, 0) :
                    undefined,
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
                pointTitle: (key) => key,
                sortKeys: (pair1, pair2) => isGreater(pair1.key, pair2.key),
                value: isSimplified ? (items) => chartValueOfSimplifiedPublications(items as Array<SimplifiedOverTimePublication>) : undefined,
                fillMissingNumberKeys: true,
                items: publications
            } as LineChartData<OverTimePublication | SimplifiedOverTimePublication>} />
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
            itemsCount={isSimplified ? tableItemsCount : undefined}
            toPresentedContent={tableToPresentedContent}
            filter={tableFilter} />
    )
}

function tableFilter(p: OverTimePublication | SimplifiedOverTimePublication, year: number) {
    return p.year === year;
}

function tableToPresentedContent(year: number) {
    return year.toString();
}

function tableItemsCount(items: Array<any>) {
    return items.length > 0 ? items[0].count : 0;
}

function chartValueOfSimplifiedPublications(items: Array<SimplifiedOverTimePublication>) {
    return items.reduce((acc, item) => acc + item.count, 0);
}

function createFilteredPublicationsUrlByYear(publicationsUrl: string, year: number) {
    const params = toYearsSearchParamsString(year);
    return publicationsUrl.includes('?') ? `${publicationsUrl}&${params}` : `${publicationsUrl}?${params}`;
}

/** Gradient displaying a distribution of publication types in a year. */
function barGradient(key: any, value?: ChartValue | undefined) {
    if (!value) {
        return {
            key: key,
            stops: [{ color: 'var(--primary)', offset: '0%' }],
            orientation: 'Vertical'
        };
    }

    const publications = value.items as Array<OverTimePublication>;
    const rolled = d3.rollup(publications, (items) => items.length, (item) => item.type);

    const keys = [...rolled.keys()];
    keys.sort((first, second) => isGreater(rolled.get(first), rolled.get(second)));
    const colors: Array<{ start: string; end: string; color: string }> = [];

    let n = 0;

    for (const key of keys) {
        const value = rolled.get(key)!;
        const color = `var(--${PUBLICATION_TYPE_COLOR[key]})`;

        colors.push({
            start: `${(n / publications.length) * 100}%`,
            end: `${((n + value) / publications.length) * 100}%`,
            color: color
        });

        n += value;
    }

    return {
        key: key,
        stops: colors.flatMap((c) => [{ color: c.color, offset: c.start }, { color: c.color, offset: c.end }]),
        orientation: 'Vertical'
    };
}