'use client'

import { forwardRef, useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent } from './Dialog'
import { MdCheckBox, MdCheckBoxOutlineBlank, MdClose } from 'react-icons/md'
import { ImCheckboxChecked, ImCheckboxUnchecked } from 'react-icons/im'
import Button from './Button'
import Tabs from './Tabs'
import { PublicationType } from '@/enums/PublicationType'
import { DblpPublication } from '@/dtos/DblpPublication'
import { group } from '@/utils/array'
import ListButton from './ListButton'
import { PUBLICATION_TYPE_TITLE } from '@/constants/client/publications'
import CheckListButton from './CheckListButton'

type PublicationFiltersDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean,
    onSubmit: (selectedTypes: Set<PublicationType>, selectedVenues: Set<string | undefined>) => void,
    publications: Array<DblpPublication>,
    selectedTypes: Set<PublicationType>,
    selectedVenues: Set<string | undefined>,
    venuesMap: Map<string | undefined, string>
}

type FilterItemParams = {
    children: React.ReactNode,
    isSelected: boolean,
    onClick: () => void
}

const FilterCategory = {
    Type: 'Type',
    Venue: 'Venue',
} as const

type FilterCategory = keyof typeof FilterCategory

export const PublicationFiltersDialog = forwardRef<HTMLDialogElement, PublicationFiltersDialogParams>(({ hide, onSubmit, animation, isOpen, publications, selectedTypes, selectedVenues, venuesMap }, ref) => {
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(FilterCategory.Type);
    const [currentlySelectedTypes, setCurrentlySelectedTypes] = useState(selectedTypes);
    const [currentlySelectedVenues, setCurrentlySelectedVenues] = useState(selectedVenues);

    const groupedPublications = useMemo(() =>
        [...group<PublicationType, DblpPublication>(publications, (publ) => publ.type)],
        [publications]);

    const selectableVenues = useMemo(() => {
        const venues = new Set<string | undefined>;

        groupedPublications.forEach((pair) => {
            if (currentlySelectedTypes.size == 0 || currentlySelectedTypes.has(pair[0])) {
                pair[1].forEach((publ) => venues.add(publ.venueId));
            }
        });

        // Deselect venues from deselected publication types
        setCurrentlySelectedVenues((currentlySelected) =>
            new Set([...currentlySelected].filter((v) => venues.has(v))));

        return [...venues.values()];
    }, [currentlySelectedTypes, groupedPublications]);

    useEffect(() => {
        if (isOpen) {
            setSelectedCategory(FilterCategory.Type);
            setCurrentlySelectedTypes(selectedTypes);
            setCurrentlySelectedVenues(selectedVenues);
        }
    }, [isOpen]);

    function updateSelectedType(type: PublicationType) {
        setCurrentlySelectedTypes((types) => currentlySelectedTypes.has(type) ?
            new Set([...types.values()].filter((t) => t != type)) :
            new Set([type, ...types.values()]));
    }

    function updateSelectedVenue(venue: string | undefined) {
        setCurrentlySelectedVenues((venues) => currentlySelectedVenues.has(venue) ?
            new Set([...venues.values()].filter((v) => v != venue)) :
            new Set([venue, ...venues.values()]));
    }

    return (
        <Dialog
            ref={ref}
            hide={hide}
            animation={animation}
            className={'dialog z-20 md:max-w-3xl w-full flex-dialog min-h-[20rem] h-[60%] overflow-y-hidden'}>
            <DialogContent
                className='max-h-[40rem] min-h-[20rem] flex-1 flex flex-col'>
                <header
                    className='flex flex-col gap-4 px-6 pt-6 pb-2 bg-inherit'>
                    <div
                        className='flex justify-between items-center'>
                        <h2
                            className='text-xl font-semibold'>
                            Filters
                        </h2>

                        <Button
                            title='Close'
                            variant='icon-outline'
                            onClick={() => hide()}>
                            <MdClose
                                className='w-5 h-5' />
                        </Button>
                    </div>

                    <Tabs
                        items={[
                            {
                                id: FilterCategory.Type,
                                content: 'Types',
                                badgeContent: currentlySelectedTypes.size > 0 ? currentlySelectedTypes.size.toString() : undefined
                            },
                            {
                                id: FilterCategory.Venue,
                                content: 'Venues',
                                badgeContent: currentlySelectedVenues.size > 0 ? currentlySelectedVenues.size.toString() : undefined
                            }
                        ]}
                        legend='Choose a filter category'
                        selectedId={selectedCategory}
                        setSelectedId={setSelectedCategory}
                        tabsId='filter-dialog-tabs'
                        size='sm'
                        className='gap-3' />
                </header>

                <div
                    className='px-6 py-6 overflow-y-auto h-full flex-1 thin-scrollbar'>
                    {
                        selectedCategory == FilterCategory.Type ?
                            <ul
                                role='tabpanel'
                                aria-labelledby={FilterCategory.Type}
                                className='flex flex-col gap-2'>
                                {groupedPublications.map(([type, publs]) =>
                                    <FilterItem
                                        key={type}
                                        isSelected={currentlySelectedTypes.has(type)}
                                        onClick={() => updateSelectedType(type)}>
                                        {PUBLICATION_TYPE_TITLE[type]}
                                    </FilterItem>)}
                            </ul> :
                            selectedCategory == FilterCategory.Venue &&
                            <ul
                                role='tabpanel'
                                aria-labelledby={FilterCategory.Venue}
                                className='flex flex-col gap-2'>
                                {selectableVenues.map((venue) =>
                                    <FilterItem
                                        key={venue || 'undefined'}
                                        isSelected={currentlySelectedVenues.has(venue)}
                                        onClick={() => updateSelectedVenue(venue)}>
                                        {venuesMap.get(venue)}
                                    </FilterItem>)}
                            </ul>
                    }
                </div>
                <div
                    className='px-6 pb-6 pt-4 flex justify-end'>
                    <Button
                        onClick={() => {
                            onSubmit(
                                currentlySelectedTypes.size == groupedPublications.length ? new Set([]) : currentlySelectedTypes,
                                currentlySelectedVenues.size == selectableVenues.length ? new Set([]) : currentlySelectedVenues);
                            hide();
                        }}>
                        Submit
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    )
});

PublicationFiltersDialog.displayName = 'PublicationFiltersDialog';

function FilterItem({ children, isSelected, onClick }: FilterItemParams) {
    return (
        <li>
            <CheckListButton
                isSelected={isSelected}
                onClick={onClick}>
                {children}
            </CheckListButton>
        </li>
    )
}