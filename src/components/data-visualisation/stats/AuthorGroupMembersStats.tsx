'use client'

import usePublicationFilters from '@/hooks/filters/usePublicationFilters'
import { cn } from '@/utils/tailwindUtils'
import { useMemo, useState } from 'react'
import StatsScaffold from '../StatsScaffold'
import { MdBarChart, MdTableChart } from 'react-icons/md'
import { DblpPublication } from '@/dtos/DblpPublication'
import FiltersList from '@/components/FiltersList'
import FiltersDialog from '@/components/dialogs/FiltersDialog'
import useDialog from '@/hooks/useDialog'
import BarChart, { BarChartData } from '../BarChart'
import CountPercentageTable from '../CountPercentageTable'
import { DblpAuthor } from '@/dtos/DblpAuthor'
import { sortByPresentedContent } from '@/utils/table'
import { isSmaller } from '@/utils/array'

type AuthorStats = {
    id: string,
    name: string,
    publicationsCount: number
}

type AuthorGroupMembersStatsParams = {
    /** All authors of an author group */
    authors: Array<DblpAuthor>,
    /** All publications of all authors of an author group */
    allPublications: Array<DblpPublication>,
    scaffoldId?: string,
    className?: string,
}

type AuthorGroupMembersBarChartParams = {
    scaffoldId?: string,
    authors: Array<AuthorStats>
}

type AuthorGroupMembersTableParams = {
    authors: Array<AuthorStats>,
    totalPublicationsCount: number
}

/** Displays statistics of all members of an author group. */
export default function AuthorGroupMembersStats({ authors, allPublications, scaffoldId, className }: AuthorGroupMembersStatsParams) {
    const [selectedPublTypesStatsVisual, setSelectedPublTypesStatsVisual] = useState('Bars');
    const { filtersMap, typesFilter, venuesFilter, yearsFilter, switchSelection, clear } = usePublicationFilters(allPublications);
    const [filtersDialog, isFiltersDialogOpen, filtersDialogAnimation, showFiltersDialog, hideFiltersDialog] = useDialog();
    const authorsStats = useMemo(() => {
        if (!typesFilter || !venuesFilter || !yearsFilter) {
            return [];
        }

        const selectedTypes = typesFilter.selectedItems;
        const selectedVenues = venuesFilter.selectedItems;
        const selectedYears = yearsFilter.selectedItems;

        return authors.map((a) => ({
            id: a.id,
            name: a.name,
            publicationsCount: a.publications
                .filter((publ) =>
                    (selectedTypes.size == 0 || selectedTypes.has(publ.type)) &&
                    (selectedVenues.size == 0 || selectedVenues.has(publ.venueId)) &&
                    (selectedYears.size == 0 || selectedYears.has(publ.year)))
                .length
        } as AuthorStats));
    }, [authors, typesFilter, venuesFilter, yearsFilter]);

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
                                scaffoldId={scaffoldId} />),
                        secondaryContent: (
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

function AuthorGroupMembersBarChart({ authors }: AuthorGroupMembersBarChartParams) {
    return (
        <BarChart
            orientation='Horizontal'
            selectedUnit='Count'
            bandThickness={45}
            secondaryAxisThickness={60}
            className='w-full h-full pl-2 xs:pl-4 pr-4 xs:pr-8 pt-7'
            data={{
                examinedProperty: (item) => item.id,
                barTitle: (key, value) => value?.items[0]?.name || key,
                color: (key) => 'primary',
                sortKeys: (pair1, pair2) => isSmaller(pair1.value?.value, pair2.value?.value),
                value: (items) => items.reduce((acc, item) => acc + item.publicationsCount, 0),
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
            itemsCount={(items) => (items.length > 0 ? items[0].publicationsCount : 0)}
            totalCount={totalPublicationsCount}
            toPresentedContent={(a: AuthorStats) => a.name}
            filter={(a: AuthorStats, ea: AuthorStats) => a.id === ea.id}
            sortExaminedValue={sortByPresentedContent}
            rowKey={(a: AuthorStats) => a.id}
            hideFooter />
    )
}