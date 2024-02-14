import { cn } from '@/utils/tailwindUtils'
import Button from './Button'
import { MdCancel, MdFilterListAlt } from 'react-icons/md'
import { FiltersState } from '@/dtos/Filters'
import { useMemo } from 'react'

type FilterItemParams = {
    onClick: () => void,
    children: React.ReactNode
}

type FiltersListParams = {
    className?: string,
    showFiltersDialog: () => void
} & FiltersState

export default function FiltersList({ className, filtersMap, clear, switchSelection, showFiltersDialog }: FiltersListParams) {
    if (Object.keys(filtersMap).length === 0) {
        return;
    }

    const filters = useMemo(() => {
        return Object.keys(filtersMap).flatMap((filterKey) => {
            const filter = filtersMap[filterKey];

            return [...filter.selectedItems].map(([key, value]) =>
                ({ filter, filterKey, itemKey: key, value }))
        });
    }, [filtersMap]);

    return (
        <ul
            className={cn('flex gap-2 flex-wrap', className)}>
            <li>
                <Button
                    className='items-center gap-2'
                    variant='outline' size='xs'
                    onClick={() => showFiltersDialog()}>
                    <MdFilterListAlt />
                    Add Filters
                </Button>
            </li>
            {filters.map(({ filter, filterKey, itemKey, value }) =>
                <FilterItem
                    key={`filter-${itemKey || 'undefined'}`}
                    onClick={() => switchSelection(filterKey, itemKey)}>
                    {filter.itemTitleSelector(value)}
                </FilterItem>)}
        </ul>
    )
}

function FilterItem({ onClick, children }: FilterItemParams) {
    return (
        <li>
            <Button
                className='items-center gap-2'
                variant='outline' size='xs'
                onClick={onClick}>
                {children}
                <MdCancel />
            </Button>
        </li>
    )
}