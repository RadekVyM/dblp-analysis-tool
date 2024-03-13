'use client'

import usePublicationFilters from '@/hooks/filters/usePublicationFilters'
import { cn } from '@/utils/tailwindUtils'
import { useMemo, useState } from 'react'
import StatsScaffold from '../StatsScaffold'
import { MdBarChart, MdTableChart } from 'react-icons/md'
import { DblpPublication } from '@/dtos/DblpPublication'
import FiltersList from '@/components/filters/FiltersList'
import FiltersDialog from '@/components/filters/FiltersDialog'
import useDialog from '@/hooks/useDialog'
import BarChart, { BarChartData } from '../charts/BarChart'
import CountPercentageTable from '../CountPercentageTable'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { sortByPresentedContent } from '@/utils/table'
import { isSmaller } from '@/utils/array'
import { toAuthorsSearchParamsString, toTypesSearchParamsString, toVenuesSearchParamsString, toYearsSearchParamsString } from '@/utils/publicationsSearchParams'
import { isNullOrWhiteSpace } from '@/utils/strings'
import { ChartValue } from '@/dtos/data-visualisation/ChartValue'
import { useRouter } from 'next/navigation'
import { createLocalPath } from '@/utils/urls'
import { SearchType } from '@/enums/SearchType'
import * as d3 from 'd3'
import { PublicationType } from '@/enums/PublicationType'
import PublicationTypesPopoverContent from './PublicationTypesPopoverContent'
import filterPublications from '@/services/publications/filters'

type AuthorStats = {
    id: string,
    name: string,
    publicationsCount: number,
    publicationTypes: d3.InternMap<PublicationType, number>
}

type AuthorGroupMembersStatsParams = {
    /** All authors of an author group */
    authors: Array<DblpAuthor>,
    /** All analysed publications of all authors of an author group */
    allPublications: Array<DblpPublication>,
    disableFilters?: boolean,
    scaffoldId?: string,
    publicationsUrl?: string,
    className?: string,
}

type AuthorGroupMembersBarChartParams = {
    scaffoldId?: string,
    authors: Array<AuthorStats>,
    onBarClick?: (key: any, value?: ChartValue) => void,
}

type AuthorGroupMembersTableParams = {
    authors: Array<AuthorStats>,
    totalPublicationsCount: number
}

/** Displays statistics of all members of an author group. */
export default function AuthorGroupMembersStats({ authors, allPublications, scaffoldId, publicationsUrl, className, disableFilters }: AuthorGroupMembersStatsParams) {
    const [selectedPublTypesStatsVisual, setSelectedPublTypesStatsVisual] = useState('Bars');
    const { filtersMap, typesFilter, venuesFilter, yearsFilter, authorsFilter, switchSelection, clear } = usePublicationFilters(allPublications);
    const [filtersDialog, isFiltersDialogOpen, filtersDialogAnimation, showFiltersDialog, hideFiltersDialog] = useDialog();
    const filteredPublicationIds = useMemo(() => {
        if (disableFilters) {
            return new Set(allPublications.map((p) => p.id));
        }

        if (!typesFilter || !venuesFilter || !yearsFilter || !authorsFilter) {
            return new Set<string>();
        }

        const selectedTypes = typesFilter.selectedItems;
        const selectedVenues = venuesFilter.selectedItems;
        const selectedYears = yearsFilter.selectedItems;
        const selectedAuthors = authorsFilter.selectedItems;

        return new Set(filterPublications(allPublications, selectedTypes, selectedVenues, selectedYears, selectedAuthors).map((p) => p.id));
    }, [allPublications, disableFilters, typesFilter, venuesFilter, yearsFilter, authorsFilter]);
    const authorsStats = useMemo(() => {
        return authors.map((a) => {
            const authorPublications = a.publications.filter((p) => filteredPublicationIds.has(p.id));

            return {
                id: a.id,
                name: a.name,
                publicationsCount: authorPublications.length,
                publicationTypes: d3.rollup(authorPublications, (items) => items.length, (item) => item.type)
            } as AuthorStats;
        });
    }, [authors, filteredPublicationIds]);
    const router = useRouter();

    return (
        <>
            <StatsScaffold
                className={cn(
                    className,
                    'max-h-[min(80vh,40rem)]',
                    selectedPublTypesStatsVisual !== 'Table' ? 'h-[100vh] min-h-[30rem]' : '')}
                items={[
                    {
                        key: 'Bars',
                        content: (
                            <AuthorGroupMembersBarChart
                                authors={authorsStats}
                                scaffoldId={scaffoldId}
                                onBarClick={publicationsUrl ?
                                    (key, value) => router.push(createFilteredPublicationsUrlByType(
                                        publicationsUrl,
                                        key,
                                        typesFilter?.selectedItems,
                                        venuesFilter?.selectedItems,
                                        yearsFilter?.selectedItems,
                                        authorsFilter?.selectedItems)) :
                                    undefined} />),
                        secondaryContent: disableFilters ? undefined : (
                            <FiltersList
                                className='p-2 min-h-0 max-h-20 overflow-y-auto thin-scrollbar'
                                showFiltersDialog={showFiltersDialog}
                                filtersMap={filtersMap}
                                switchSelection={switchSelection}
                                clear={clear} />),
                        title: 'Bar chart',
                        icon: (<MdBarChart />),

                    },
                    {
                        key: 'Table',
                        content: (<AuthorGroupMembersTable authors={authorsStats} totalPublicationsCount={allPublications.length} />),
                        title: 'Table',
                        icon: (<MdTableChart />),
                        secondaryContent: (
                            <FiltersList
                                className='m-2'
                                showFiltersDialog={showFiltersDialog}
                                filtersMap={filtersMap}
                                switchSelection={switchSelection}
                                clear={clear} />),
                    },
                ]}
                scaffoldId={scaffoldId || 'publication-types-stats'}
                sideTabsLegend='Choose data visualisation'
                selectedKey={selectedPublTypesStatsVisual}
                onKeySelected={setSelectedPublTypesStatsVisual} />

            <FiltersDialog
                filtersMap={filtersMap}
                clear={clear}
                switchSelection={switchSelection}
                hide={hideFiltersDialog}
                animation={filtersDialogAnimation}
                isOpen={isFiltersDialogOpen}
                ref={filtersDialog} />
        </>
    )
}

function AuthorGroupMembersBarChart({ authors, onBarClick }: AuthorGroupMembersBarChartParams) {
    return (
        <BarChart
            orientation='Horizontal'
            selectedUnit='Count'
            bandThickness={45}
            secondaryAxisThickness={60}
            className='w-full h-full pl-2 xs:pl-4 pr-4 xs:pr-8 pt-7'
            onBarClick={onBarClick}
            data={{
                examinedProperty: (item) => item.id,
                barTitle: (key, value) => value?.items[0]?.name || key,
                barLink: (key, value) => createLocalPath(key, SearchType.Author),
                color: (key) => 'var(--primary)',
                sortKeys: (pair1, pair2) => isSmaller(pair1.value?.value, pair2.value?.value),
                value: (items) => items.reduce((acc, item) => acc + item.publicationsCount, 0),
                popoverContent: (key, value) => {
                    if (!value?.items[0]) {
                        return undefined;
                    }

                    const author = value?.items[0] as AuthorStats;

                    return (
                        <PublicationTypesPopoverContent
                            publicationTypes={author.publicationTypes} />
                    )
                },
                items: authors
            } as BarChartData<AuthorStats>} />
    )
}

function AuthorGroupMembersTable({ authors, totalPublicationsCount }: AuthorGroupMembersTableParams) {
    return (
        <CountPercentageTable
            examinedValueTitle='Member'
            examinedValueSortTitle='Sort by member name'
            examinedValues={authors}
            items={authors}
            itemsCount={tableItemsCount}
            totalCount={totalPublicationsCount}
            toPresentedContent={tableToPresentedContent}
            toHref={tableToHref}
            filter={tableFilter}
            sortExaminedValue={sortByPresentedContent}
            rowKey={tableRowKey}
            hideFooter />
    )
}

function tableRowKey(a: AuthorStats) {
    return a.id;
}

function tableFilter(a: AuthorStats, ea: AuthorStats) {
    return a.id === ea.id;
}

function tableToPresentedContent(a: AuthorStats) {
    return a.name;
}

function tableToHref(a: AuthorStats) {
    return createLocalPath(a.id, SearchType.Author);
}

function tableItemsCount(items: Array<any>) {
    return items.length > 0 ? items[0].publicationsCount : 0;
}

function createFilteredPublicationsUrlByType(
    publicationsUrl: string,
    authorId: string,
    selectedTypes?: Map<any, any>,
    selectedVenues?: Map<any, any>,
    selectedYears?: Map<any, any>,
    selectedAuthors?: Map<any, any>) {
    const typesParams = toTypesSearchParamsString(...(selectedTypes?.keys() || []));
    const venuesParams = toVenuesSearchParamsString(...(selectedVenues?.keys() || []));
    const yearsParams = toYearsSearchParamsString(...(selectedYears?.keys() || []));
    const authorsParams = toAuthorsSearchParamsString(authorId, ...(selectedAuthors?.keys() || []));
    const params = [typesParams, venuesParams, yearsParams, authorsParams].filter((p) => !isNullOrWhiteSpace(p)).join('&');
    return publicationsUrl.includes('?') ? `${publicationsUrl}&${params}` : `${publicationsUrl}?${params}`;
}