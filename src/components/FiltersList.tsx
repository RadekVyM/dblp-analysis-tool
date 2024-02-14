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
    const filters = useMemo(() => {
        return Object.keys(filtersMap).flatMap((filterKey) => {
            const filter = filtersMap[filterKey];

            return [...filter.selectedItems].map(([key, value]) =>
                ({ filter, filterKey, itemKey: key, value }))
        });
    }, [filtersMap]);

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