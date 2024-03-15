'use client'

import { SavedItem } from '@/dtos/saves/SavedItem'
import { useEffect, useState } from 'react'

/**
 * Hook that creates data structures for managing selected saved items and related operations.
 * @param defaultSavedAuthors Saved authors that can be selected
 * @param defaultSavedVenues Saved venues that can be selected
 * @param defaultAuthorGroups Author groups that can be selected
 * @returns Data structures for managing selected saved items and related operations
 */
export default function useSelectableSavedItems(
    defaultSavedAuthors: Array<SavedItem>,
    defaultSavedVenues: Array<SavedItem>,
    defaultAuthorGroups: Array<SavedItem>,
) {
    const [selectedSavedAuthors, toggleSavedAuthor, toggleAllSavedAuthors] = useSelectedItems(defaultSavedAuthors);
    const [selectedSavedVenues, toggleSavedVenue, toggleAllSavedVenues] = useSelectedItems(defaultSavedVenues);
    const [selectedAuthorGroups, toggleAuthorGroup, toggleAllAuthorGroups] = useSelectedItems(defaultAuthorGroups);

    return {
        selectedSavedAuthors, toggleSavedAuthor, toggleAllSavedAuthors,
        selectedSavedVenues, toggleSavedVenue, toggleAllSavedVenues,
        selectedAuthorGroups, toggleAuthorGroup, toggleAllAuthorGroups
    };
}

function useSelectedItems(defaultSelectedItems: Array<SavedItem>): [Set<string>, (id: string) => void, (items: Array<SavedItem>) => void] {
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    function toggleItem(id: string) {
        setSelectedItems((old) => {
            const newSet = new Set(old);

            if (newSet.has(id)) {
                newSet.delete(id);
            }
            else {
                newSet.add(id);
            }

            return newSet;
        });
    }

    function toggleAll(items: Array<SavedItem>) {
        setSelectedItems((old) => {
            return items.every((item) => selectedItems.has(item.id)) ?
                new Set() :
                new Set(items.map((item) => item.id));
        })
    }

    useEffect(() => {
        setSelectedItems(new Set(defaultSelectedItems.map((item) => item.id)));
    }, [defaultSelectedItems]);

    return [selectedItems, toggleItem, toggleAll];
}