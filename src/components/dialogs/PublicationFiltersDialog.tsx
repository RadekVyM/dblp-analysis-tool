'use client'

import { forwardRef, useEffect, useState } from 'react'
import { Dialog, DialogContent } from './Dialog'
import Tabs from '../Tabs'
import CheckListButton from '../CheckListButton'
import DialogHeader from './DialogHeader'
import DialogBody from './DialogBody'
import { FiltersState } from '@/hooks/filters/usePublicationsFilter'

type PublicationFiltersDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean
} & FiltersState

type FilterItemParams = {
    children: React.ReactNode,
    isSelected: boolean,
    onClick: () => void
}

export const FilterCategory = {
    Type: 'Type',
    Venue: 'Venue',
} as const

export type FilterCategory = keyof typeof FilterCategory

export const PublicationFiltersDialog = forwardRef<HTMLDialogElement, PublicationFiltersDialogParams>((
    {
        hide, animation, isOpen, filtersMap, clear, switchSelection
    },
    ref
) => {
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(FilterCategory.Type);

    useEffect(() => {
        if (isOpen) {
            setSelectedCategory(FilterCategory.Type);
        }
    }, [isOpen]);

    const typesFilter = filtersMap[FilterCategory.Type];
    const venuesFilter = filtersMap[FilterCategory.Venue];

    if (!typesFilter || !venuesFilter) {
        return;
    }

    return (
        <Dialog
            ref={ref}
            hide={hide}
            animation={animation}
            className={'dialog z-20 md:max-w-3xl w-full flex-dialog min-h-[20rem] h-[60%] overflow-y-hidden'}>
            <DialogContent
                className='max-h-[40rem] min-h-[20rem] flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Filters'}>
                    <Tabs
                        items={[
                            {
                                id: FilterCategory.Type,
                                content: 'Types',
                                badgeContent: typesFilter.selectedItems.size > 0 ? typesFilter.selectedItems.size.toString() : undefined
                            },
                            {
                                id: FilterCategory.Venue,
                                content: 'Venues',
                                badgeContent: venuesFilter.selectedItems.size > 0 ? venuesFilter.selectedItems.size.toString() : undefined
                            }
                        ]}
                        legend='Choose a filter category'
                        selectedId={selectedCategory}
                        setSelectedId={setSelectedCategory}
                        tabsId='filter-dialog-tabs'
                        size='sm'
                        className='gap-3' />
                </DialogHeader>

                <DialogBody>
                    {
                        selectedCategory == FilterCategory.Type ?
                            <ul
                                role='tabpanel'
                                aria-labelledby={FilterCategory.Type}
                                className='flex flex-col gap-2'>
                                {[...typesFilter.selectableItems].map(([key, value]) =>
                                    <FilterItem
                                        key={key}
                                        isSelected={typesFilter.selectedItems.has(key)}
                                        onClick={() => switchSelection(FilterCategory.Type, key)}>
                                        {typesFilter.itemTitleSelector(value)}
                                    </FilterItem>)}
                            </ul> :
                            selectedCategory == FilterCategory.Venue &&
                            <ul
                                role='tabpanel'
                                aria-labelledby={FilterCategory.Venue}
                                className='flex flex-col gap-2'>
                                {[...venuesFilter.selectableItems].map(([key, value]) =>
                                    <FilterItem
                                        key={key || 'undefined'}
                                        isSelected={venuesFilter.selectedItems.has(key)}
                                        onClick={() => switchSelection(FilterCategory.Venue, key)}>
                                        {venuesFilter.itemTitleSelector(value)}
                                    </FilterItem>)}
                            </ul>
                    }
                </DialogBody>
            </DialogContent>
        </Dialog >
    )
});

PublicationFiltersDialog.displayName = 'PublicationFiltersDialog';

function FilterItem({ children, isSelected, onClick }: FilterItemParams) {
    return (
        <li>
            <CheckListButton
                className='w-full'
                isSelected={isSelected}
                onClick={onClick}>
                {children}
            </CheckListButton>
        </li>
    )
}