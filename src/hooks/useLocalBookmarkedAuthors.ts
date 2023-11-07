'use client'

import { SavedAuthor, SavedAuthors } from '@/dtos/SavedAuthors'
import { useCallback } from 'react'
import { useLocalStorage } from 'usehooks-ts'

const LOCAL_AUTHOR_BOOKMARKS_KEY = 'local-authors-bookmarks';

export default function useLocalBookmarkedAuthors() {
    const [authors, setAuthors] = useLocalStorage<SavedAuthors>(LOCAL_AUTHOR_BOOKMARKS_KEY, {
        recentlySeen: []
    });

    const addRecentlySeenAuthor = useCallback((id: string, title: string) => {
        setAuthors((prev) => {
            prev.recentlySeen = [{ title: title, id: id }, ...prev.recentlySeen];
            return { ...prev };
        });
    }, [authors]);

    const removeRecentlySeenAuthor = useCallback((id: string) => {
        setAuthors((prev) => {
            prev.recentlySeen = prev.recentlySeen.filter((a) => a.id != id);
            return { ...prev };
        });
    }, [authors]);
    
    return {
        authors,
        addRecentlySeenAuthor,
        removeRecentlySeenAuthor
    }
}