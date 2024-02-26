'use client'

import { useCallback } from 'react'
import { VisitedVenue } from '@/dtos/saves/VisitedVenue'
import { useIsClient, useLocalStorage } from 'usehooks-ts'

const VISITED_VENUES_STORAGE_KEY = 'VISITED_VENUES_STORAGE_KEY';

/** Hook that handles loading of visited venues and provides operations for adding and deleting a visited venue. */
export default function useVisitedVenues() {
    const [visitedVenues, setVisitedVenues] = useLocalStorage(VISITED_VENUES_STORAGE_KEY, new Array<VisitedVenue>());
    const isClient = useIsClient();

    const visitedVenue = useCallback(async (id: string, title: string) => {
        setVisitedVenues((old) => {
            const venue = old.find((v) => v.id === id);

            if (venue) {
                venue.visitsCount += 1;
                return [venue, ...(old.filter((v) => v.id !== id))];
            }

            return [{ title: title, id: id, visitsCount: 1 }, ...old];
        });
    }, [setVisitedVenues]);

    const removeVisitedVenue = useCallback(async (id: string) => {
        setVisitedVenues((old) => {
            return [...(old.filter((v) => v.id !== id))];
        });
    }, [setVisitedVenues]);

    return {
        visitedVenues,
        canUseVisitedVenues: isClient,
        visitedVenue,
        removeVisitedVenue
    };
}