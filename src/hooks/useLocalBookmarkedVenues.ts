'use client'

import { SavedVenues } from '@/dtos/SavedVenues'
import { useCallback } from 'react'
import { useLocalStorage } from 'usehooks-ts'

const LOCAL_VENUE_BOOKMARKS_KEY = 'local-venue-bookmarks';

export default function useLocalBookmarkedVenues() {
    const [venues, setVenues] = useLocalStorage<SavedVenues>(LOCAL_VENUE_BOOKMARKS_KEY, {
        recentlySeen: [],
        bookmarked: []
    });

    const addRecentlySeenVenue = useCallback((id: string, title: string) => {
        setVenues((prev) => {
            prev.recentlySeen = [{ title: title, id: id }, ...prev.recentlySeen];
            return { ...prev };
        });
    }, [venues]);

    const removeRecentlySeenVenue = useCallback((id: string) => {
        setVenues((prev) => {
            prev.recentlySeen = prev.recentlySeen.filter((v) => v.id != id);
            return { ...prev };
        });
    }, [venues]);

    const addBookmarkedVenue = useCallback((id: string, title: string) => {
        setVenues((prev) => {
            prev.bookmarked = [{ title: title, id: id }, ...prev.bookmarked];
            return { ...prev };
        });
    }, [venues]);

    const removeBookmarkedVenue = useCallback((id: string) => {
        setVenues((prev) => {
            prev.bookmarked = prev.bookmarked.filter((v) => v.id != id);
            return { ...prev };
        });
    }, [venues]);

    return {
        venues,
        addRecentlySeenVenue,
        removeRecentlySeenVenue,
        addBookmarkedVenue,
        removeBookmarkedVenue,
    }
}