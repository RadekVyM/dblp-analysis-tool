'use client'

import { forwardRef, useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent } from './Dialog'
import Tabs from '../Tabs'
import CheckListButton from '../CheckListButton'
import DialogHeader from './DialogHeader'
import DialogBody from './DialogBody'
import Button from '../Button'
import { MdFilterAltOff } from 'react-icons/md'
import { FiltersState } from '@/dtos/Filters'

type FiltersDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean
} & FiltersState

type FilterItemParams = {
    children: React.ReactNode,
    isSelected: boolean,
    onClick: () => void
}

const FiltersDialog = forwardRef<HTMLDialogElement, FiltersDialogParams>((
    { hide, animation, isOpen, filtersMap, clear, switchSelection },
    ref
) => {
    const [selectedKey, setSelectedKey] = useState<any>(Object.keys(filtersMap)[0]);
    const tabs = useMemo(
        () => Object.keys(filtersMap).map((key) => {
            const value = filtersMap[key];

            return {
                id: key,
                content: value.title,
                badgeContent: value.selectedItems.size > 0 ? value.selectedItems.size.toString() : undefined
            }
        }),
        [filtersMap]);

    useEffect(() => {
        if (isOpen) {
            setSelectedKey(Object.keys(filtersMap)[0]);
        }
    }, [isOpen]);

    if (Object.keys(filtersMap).length === 0) {
        return;
    }

    const selectedFilter = filtersMap[selectedKey];

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
                        items={tabs}
                        legend='Choose a filter category'
                        selectedId={selectedKey}
                        setSelectedId={setSelectedKey}
                        tabsId='filter-dialog-tabs'
                        size='sm'
                        className='gap-3' />
                </DialogHeader>

                <DialogBody>
                    {
                        selectedFilter &&
                        <>
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
                                {[...selectedFilter.selectableItems].map(([key, value]) =>
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
            </DialogContent>
        </Dialog >
    )
});

FiltersDialog.displayName = 'FiltersDialog';
export default FiltersDialog;

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