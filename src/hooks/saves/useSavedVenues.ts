'use client'

import { SavedVenue } from '@/dtos/saves/SavedVenue'
import { useCallback } from 'react'
import { useIsClient, useLocalStorage } from 'usehooks-ts'

const SAVED_VENUES_STORAGE_KEY = 'SAVED_VENUES_STORAGE_KEY';

/** Hook that handles loading of saved venues and provides operations for adding and deleting a saved venue. */
export default function useSavedVenues() {
    const [savedVenues, setSavedVenues] = useLocalStorage(SAVED_VENUES_STORAGE_KEY, new Array<SavedVenue>());
    const isClient = useIsClient();

    const saveVenue = useCallback(async (id: string, title: string) => {
        setSavedVenues((old) => {
            const venue = old.find((v) => v.id === id);

            if (venue) {
                return [venue, ...(old.filter((v) => v.id !== id))];
            }

            return [{ title: title, id: id }, ...old];
        });
    }, [setSavedVenues]);

    const removeSavedVenue = useCallback(async (id: string) => {
        setSavedVenues((old) => {
            return [...(old.filter((v) => v.id !== id))];
        });
    }, [setSavedVenues]);

    return {
        savedVenues,
        canUseSavedVenues: isClient,
        saveVenue,
        removeSavedVenue
    };
}