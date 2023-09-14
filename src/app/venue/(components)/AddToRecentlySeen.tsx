'use client'

import useLocalBookmarkedVenues from '@/client/hooks/useLocalBookmarkedVenues'
import { useEffect } from 'react'

type AddToRecentlySeenParams = {
    id: string,
    title: string
}

export default function AddToRecentlySeen({ id, title }: AddToRecentlySeenParams) {
    const { addRecentlySeenVenue, removeRecentlySeenVenue } = useLocalBookmarkedVenues();

    useEffect(() => {
        removeRecentlySeenVenue(id);
        addRecentlySeenVenue(id, title);
    }, []);

    return (
        <></>
    )
}