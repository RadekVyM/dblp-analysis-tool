import { cn } from '@/utils/tailwindUtils'
import Button from '@/components/inputs/Button'
import { MdCancel, MdFilterListAlt } from 'react-icons/md'
import { FiltersState } from '@/dtos/Filters'
import { useMemo } from 'react'

type FilterItemParams = {
    onClick: () => void,
    children: React.ReactNode
}

type FiltersListParams = {
    className?: string,
    maxDisplayedCount?: number,
    showFiltersDialog: () => void
} & FiltersState

/** Displays selected filters in a horizontal list and provides a button to display FiltersDialog. */
export default function FiltersList({ className, filtersMap, maxDisplayedCount, clear, switchSelection, showFiltersDialog }: FiltersListParams) {
    const allFilters = useMemo(() => {
        return Object.keys(filtersMap).flatMap((filterKey) => {
            const filter = filtersMap[filterKey];

            return [...filter.selectedItems].map(([key, value]) =>
                ({ filter, filterKey, itemKey: key, value }));
        });
    }, [filtersMap]);
    const filters = useMemo(() => {
        return maxDisplayedCount ?
            allFilters.slice(0, maxDisplayedCount) :
            allFilters;
    }, [allFilters, maxDisplayedCount]);

    if (Object.keys(filtersMap).length === 0) {
        return;
    }

    return (
        <ul
            className={cn('flex gap-2 flex-wrap', className)}>
            <li>
                <Button
                    className='items-center gap-2'
                    variant='outline' size='xs'
                    onClick={() => showFiltersDialog()}>
                    <MdFilterListAlt />
                    Add filters
                </Button>
            </li>
            {filters.map(({ filter, filterKey, itemKey, value }) =>
                <FilterItem
                    key={`filter-${itemKey || 'undefined'}`}
                    onClick={() => switchSelection(filterKey, itemKey)}>
                    {filter.itemTitleSelector(value)}
                </FilterItem>)}
            {maxDisplayedCount && filters.length < allFilters.length &&
                <li>
                    <Button
                        variant='outline' size='xs'
                        onClick={() => showFiltersDialog()}>
                        + {allFilters.length - filters.length} more
                    </Button>
                </li>}
        </ul>
    )
}

function FilterItem({ onClick, children }: FilterItemParams) {
    return (
        <li
            className='max-w-full'>
            <Button
                className='max-w-full grid grid-cols-[1fr_auto] gap-x-2'
                variant='outline' size='xs'
                onClick={onClick}>
                <div
                    className='text-ellipsis whitespace-nowrap min-w-0 overflow-hidden'>
                    {children}
                </div>
                <MdCancel />
            </Button>
        </li>
    )
}