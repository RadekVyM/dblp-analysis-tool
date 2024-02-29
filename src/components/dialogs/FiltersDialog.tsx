'use client'

import { forwardRef, useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent } from './Dialog'
import Tabs from '../Tabs'
import CheckListButton from '../CheckListButton'
import DialogHeader from './DialogHeader'
import DialogBody from './DialogBody'
import Button from '../Button'
import { MdFilterAltOff } from 'react-icons/md'
import { FilterState, FilterStatesMap, FiltersState } from '@/dtos/Filters'
import { isGreater, isSmaller } from '@/utils/array'
import SearchBox from '../SearchBox'
import { cn } from '@/utils/tailwindUtils'
import { isNullOrWhiteSpace, removeAccents, searchIncludes } from '@/utils/strings'

type FiltersDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean
} & FiltersState

type FiltersDialogBodyParams = {
    selectedFilter: FilterState,
    selectedKey: any,
    switchSelection: (filterKey: string, itemKey: any) => void,
    clear: (filterKey: string) => void,
}

type FilterItemParams = {
    children: React.ReactNode,
    isSelected: boolean,
    onClick: () => void
}

/** Dialog for filtering a collection of items. */
const FiltersDialog = forwardRef<HTMLDialogElement, FiltersDialogParams>((
    { hide, animation, isOpen, filtersMap, clear, switchSelection },
    ref
) => {
    const { tabs, selectedKey, setSelectedKey } = useFiltersDialogState(filtersMap, isOpen);

    if (Object.keys(filtersMap).length === 0) {
        return;
    }

    const selectedFilter = filtersMap[selectedKey];

    return (
        <Dialog
            ref={ref}
            hide={hide}
            animation={animation}
            className={'dialog md:max-w-3xl w-full flex-dialog min-h-[20rem] h-[70%] max-h-[min(48rem,90%)]'}>
            <DialogContent
                className='min-h-[20rem] max-h-full flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Filters'}>
                    <Tabs
                        items={tabs}
                        legend='Choose a filter category'
                        selectedId={selectedKey}
                        setSelectedId={setSelectedKey}
                        tabsId='filter-dialog-tabs'
                        size='sm'
                        className='gap-3' />
                </DialogHeader>

                <FiltersDialogBody
                    selectedFilter={selectedFilter}
                    selectedKey={selectedKey}
                    clear={clear}
                    switchSelection={switchSelection} />
            </DialogContent>
        </Dialog>
    )
});

FiltersDialog.displayName = 'FiltersDialog';
export default FiltersDialog;

function FiltersDialogBody({ selectedFilter, selectedKey, clear, switchSelection }: FiltersDialogBodyParams) {
    const [searchQuery, setSearchQuery] = useState('');
    const selectableItems = useMemo(() => {
        const items = selectedFilter?.selectableItems ?
            [...selectedFilter?.selectableItems]
                .filter(([key, value]) =>
                    isNullOrWhiteSpace(searchQuery) ||
                    searchIncludes(selectedFilter.itemTitleSelector(value) as string, searchQuery)) :
            [];

        items.sort(([key1, value1], [key2, value2]) => isGreater(value1, value2));

        return items;
    }, [selectedFilter?.selectableItems, searchQuery]);

    useEffect(() => {
        setSearchQuery('');
    }, [selectedKey]);

    return (
        <DialogBody
            className={cn('isolate pt-0')}>
            {
                selectedFilter &&
                <>
                    {
                        selectedFilter.description &&
                        <span className='mb-2 mt-2 inline-block text-sm text-on-surface-container-muted'>{selectedFilter.description}</span>
                    }
                    <div
                        className='z-20 bg-surface-container sticky top-0 pt-2 pb-4'>
                        <SearchBox
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery} />
                    </div>
                    <Button
                        className='mb-5 items-center gap-x-2'
                        variant='outline'
                        size='xs'
                        onClick={() => clear(selectedKey)}
                        disabled={selectedFilter.selectedItems.size === 0}>
                        <MdFilterAltOff />
                        Clear These Filters
                    </Button>
                    <ul
                        role='tabpanel'
                        aria-labelledby={selectedKey}
                        className='flex flex-col gap-2'>
                        {selectableItems.map(([key, value]) =>
                            <FilterItem
                                key={`${key || 'undefined'}`}
                                isSelected={selectedFilter.selectedItems.has(key)}
                                onClick={() => switchSelection(selectedKey, key)}>
                                {selectedFilter.itemTitleSelector(value)}
                            </FilterItem>)}
                    </ul>
                </>
            }
        </DialogBody>
    )
}

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

function useFiltersDialogState(filtersMap: FilterStatesMap, isDialogOpen: boolean) {
    const [selectedKey, setSelectedKey] = useState<any>(Object.keys(filtersMap)[0]);
    const tabs = useMemo(
        () => Object.keys(filtersMap).map((key) => {
            const value = filtersMap[key];

            return {
                id: key,
                content: value.title,
                badgeContent: value.selectedItems.size > 0 ? value.selectedItems.size.toString() : undefined
            };
        }),
        [filtersMap]);

    useEffect(() => {
        if (isDialogOpen) {
            setSelectedKey(Object.keys(filtersMap)[0]);
        }
    }, [isDialogOpen]);

    return {
        selectedKey,
        setSelectedKey,
        tabs
    };
}