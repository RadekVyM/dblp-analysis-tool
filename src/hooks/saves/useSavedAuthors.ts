'use client'

import { useCallback } from 'react'
import { SavedAuthor } from '@/dtos/saves/SavedAuthor'
import { useIsClient, useLocalStorage } from 'usehooks-ts'

const SAVED_AUTHORS_STORAGE_KEY = 'SAVED_AUTHORS_STORAGE_KEY';

/** Hook that handles loading of saved authors and provides operations for adding and deleting a saved author. */
export default function useSavedAuthors() {
    const [savedAuthors, setSavedAuthors] = useLocalStorage(SAVED_AUTHORS_STORAGE_KEY, new Array<SavedAuthor>());
    const isClient = useIsClient();

    const saveAuthor = useCallback(async (id: string, title: string) => {
        setSavedAuthors((old) => {
            const author = old.find((a) => a.id === id);

            if (author) {
                return [author, ...(old.filter((a) => a.id !== id))];
            }

            return [{ title: title, id: id }, ...old];
        });
    }, [setSavedAuthors]);

    const removeSavedAuthor = useCallback(async (id: string) => {
        setSavedAuthors((old) => {
            return [...(old.filter((a) => a.id !== id))];
        });
    }, [setSavedAuthors]);

    return {
        canUseSavedAuthors: isClient,
        savedAuthors,
        saveAuthor,
        removeSavedAuthor,
    };
}