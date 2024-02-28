'use client'

import { SavedItem } from '@/dtos/saves/SavedItem'
import CheckListButton from './CheckListButton'

type SavedItemsSelectionParams = {
    savedAuthors: Array<SavedItem>,
    selectedSavedAuthors: Set<string>,
    toggleSavedAuthor: (id: string) => void,
    toggleAllSavedAuthors: (items: Array<SavedItem>) => void,
    savedVenues: Array<SavedItem>,
    selectedSavedVenues: Set<string>,
    toggleSavedVenue: (id: string) => void,
    toggleAllSavedVenues: (items: Array<SavedItem>) => void,
    authorGroups: Array<SavedItem>,
    selectedAuthorGroups: Set<string>,
    toggleAuthorGroup: (id: string) => void,
    toggleAllAuthorGroups: (items: Array<SavedItem>) => void
}

type ItemsSectionParams = {
    items: Array<SavedItem>,
    title: React.ReactNode,
    selectedItemIds: Set<string>,
    toggleItem: (id: string) => void,
    toggleAll: (items: Array<SavedItem>) => void
}

export default function SavedItemsSelection({
    savedAuthors, selectedSavedAuthors, toggleSavedAuthor, toggleAllSavedAuthors,
    savedVenues, selectedSavedVenues, toggleSavedVenue, toggleAllSavedVenues,
    authorGroups, selectedAuthorGroups, toggleAuthorGroup, toggleAllAuthorGroups
}: SavedItemsSelectionParams) {
    return (
        <>
            {savedAuthors.length > 0 &&
                <ItemsSection
                    items={savedAuthors}
                    selectedItemIds={selectedSavedAuthors}
                    toggleItem={toggleSavedAuthor}
                    toggleAll={toggleAllSavedAuthors}
                    title='Saved authors' />}
            {authorGroups.length > 0 &&
                <ItemsSection
                    items={authorGroups}
                    selectedItemIds={selectedAuthorGroups}
                    toggleItem={toggleAuthorGroup}
                    toggleAll={toggleAllAuthorGroups}
                    title='Author groups' />}
            {savedVenues.length > 0 &&
                <ItemsSection
                    items={savedVenues}
                    selectedItemIds={selectedSavedVenues}
                    toggleItem={toggleSavedVenue}
                    toggleAll={toggleAllSavedVenues}
                    title='Saved venues' />}
        </>
    )
}

function ItemsSection({ items, selectedItemIds, title, toggleItem, toggleAll }: ItemsSectionParams) {
    return (
        <section>
            <header
                className='mb-1'>
                <CheckListButton
                    className='w-full'
                    isSelected={items.every((item) => selectedItemIds.has(item.id))}
                    onClick={() => toggleAll(items)}>
                    {title}
                </CheckListButton>
            </header>
            <ul
                className='flex flex-col gap-1 ml-5'>
                {items.map((item) => (
                    <li
                        key={item.id}>
                        <CheckListButton
                            className='w-full'
                            isSelected={selectedItemIds.has(item.id)}
                            onClick={() => toggleItem(item.id)}>
                            {item.title}
                        </CheckListButton>
                    </li>
                ))}
            </ul>
        </section>
    )
}